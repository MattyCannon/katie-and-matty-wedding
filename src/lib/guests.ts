/**
 * Server-only guest-list logic, backed by the "Guest List" tab of the RSVP sheet.
 *
 * The tab is found BY NAME (not by position), and columns are matched by header
 * name (not by position), so the sheet's column order can change freely.
 *
 * ---------------------------------------------------------------------------
 * EDIT ME if the sheet's headers change
 * ---------------------------------------------------------------------------
 * `COLUMN_ALIASES` below maps the three fields the site needs onto the header
 * text used in the sheet. Matching ignores case, spaces, underscores and
 * hyphens, so "Group ID", "group_id" and "GroupID" are all equivalent — you only
 * need to add an entry when the wording itself differs (e.g. "Party").
 *
 * If a required column can't be found, the error message lists the headers that
 * were actually present, which is usually enough to spot the mismatch.
 *
 * RSVP responses are written back onto the same tab in these columns, which are
 * appended automatically on first response: RSVP_Status, RSVP_Email,
 * RSVP_Timestamp.
 */
import { getDoc } from "@/lib/googleSheet";
import { normalizeName, type GuestMember, type AttendanceEntry } from "@/lib/guestTypes";

/** The tab holding the guest list, matched by title. */
const GUEST_TAB_TITLE = "Guest List";

/** Accepted header wordings for each field the site needs. */
const COLUMN_ALIASES = {
  /** Groups people into a party — everyone sharing a value RSVPs together. */
  groupId: ["Group_ID", "Group", "Party_ID", "Party", "Household", "Household_ID"],
  /** The guest's name, as guests will search for it. */
  name: ["Name", "Guest_Name", "Full_Name", "Guest"],
  /** "Yes" = invited to the ceremony as well as the evening. */
  ceremonyGuest: ["Ceremony_Guest", "Ceremony", "Day_Guest", "Day", "Invited_To_Ceremony"],
} as const;

/** Columns the site writes back. Appended to the header row if absent. */
const RESPONSE_COLS = ["RSVP_Status", "RSVP_Email", "RSVP_Timestamp"] as const;

type GuestRow = { groupId: string; name: string; ceremonyGuest: boolean };
type ResolvedColumns = { groupId: string; name: string; ceremonyGuest: string };

/** Loose header comparison: case, spaces, underscores and hyphens are ignored. */
function headerKey(value: string): string {
  return value.toLowerCase().replace(/[\s_-]+/g, "");
}

/**
 * Map each required field onto the real header text found in the sheet.
 * `ceremonyGuest` is optional — if absent, everyone is treated as a full-day
 * guest rather than failing the whole lookup.
 */
function resolveColumns(headers: string[]): ResolvedColumns {
  const byKey = new Map(headers.filter(Boolean).map((h) => [headerKey(h), h]));

  function find(field: keyof typeof COLUMN_ALIASES): string | undefined {
    for (const alias of COLUMN_ALIASES[field]) {
      const match = byKey.get(headerKey(alias));
      if (match) return match;
    }
    return undefined;
  }

  const groupId = find("groupId");
  const name = find("name");
  const ceremonyGuest = find("ceremonyGuest");

  const missing: string[] = [];
  if (!groupId) missing.push(`groupId (tried: ${COLUMN_ALIASES.groupId.join(", ")})`);
  if (!name) missing.push(`name (tried: ${COLUMN_ALIASES.name.join(", ")})`);
  if (missing.length > 0) {
    throw new Error(
      `Guest-list columns not found on the "${GUEST_TAB_TITLE}" tab: ${missing.join("; ")}. ` +
        `Headers present: ${headers.join(", ") || "(none)"}. ` +
        `Add the sheet's wording to COLUMN_ALIASES in src/lib/guests.ts.`
    );
  }

  return { groupId: groupId!, name: name!, ceremonyGuest: ceremonyGuest ?? "" };
}

/** The guest-list tab, with its header row loaded and columns resolved. */
async function getGuestSheet() {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[GUEST_TAB_TITLE];
  if (!sheet) {
    const titles = doc.sheetsByIndex.map((s) => s.title).join(", ");
    throw new Error(
      `Tab "${GUEST_TAB_TITLE}" not found in the spreadsheet. Tabs present: ${titles || "(none)"}.`
    );
  }
  await sheet.loadHeaderRow();
  const cols = resolveColumns(sheet.headerValues ?? []);
  return { sheet, cols };
}

/** Short-lived cache so autocomplete doesn't hit the Sheets API on every keystroke. */
let listCache: { rows: GuestRow[]; at: number } | null = null;
const LIST_TTL_MS = 60_000;

async function loadGuestRows(): Promise<GuestRow[]> {
  const { sheet, cols } = await getGuestSheet();
  const rows = await sheet.getRows();
  return rows
    .map((r) => ({
      groupId: String(r.get(cols.groupId) ?? "").trim(),
      name: String(r.get(cols.name) ?? "").trim(),
      ceremonyGuest: cols.ceremonyGuest
        ? String(r.get(cols.ceremonyGuest) ?? "").trim().toLowerCase() === "yes"
        : true,
    }))
    .filter((g) => g.name && g.groupId);
}

async function getGuestList(): Promise<GuestRow[]> {
  if (listCache && Date.now() - listCache.at < LIST_TTL_MS) {
    return listCache.rows;
  }
  const rows = await loadGuestRows();
  listCache = { rows, at: Date.now() };
  return rows;
}

/** Names matching the query (substring, case-insensitive), deduped + capped. */
export async function searchGuestNames(query: string, limit = 8): Promise<string[]> {
  const q = normalizeName(query);
  if (q.length < 2) return [];
  const list = await getGuestList();
  const seen = new Set<string>();
  const out: string[] = [];
  for (const g of list) {
    if (normalizeName(g.name).includes(q) && !seen.has(g.name)) {
      seen.add(g.name);
      out.push(g.name);
      if (out.length >= limit) break;
    }
  }
  return out;
}

/** Everyone sharing the selected guest's group. */
export async function resolveGroup(name: string): Promise<{ found: boolean; members: GuestMember[] }> {
  const target = normalizeName(name);
  const list = await getGuestList();
  const anchor = list.find((g) => normalizeName(g.name) === target);
  if (!anchor) return { found: false, members: [] };
  const members = list
    .filter((g) => g.groupId === anchor.groupId)
    .map((g) => ({ name: g.name, ceremonyGuest: g.ceremonyGuest }));
  return { found: true, members };
}

/**
 * Write each member's response back onto the guest-list tab. The group is
 * re-resolved server-side from the anchor name (we don't trust the client's
 * member list), and only rows in that group with a matching response are set.
 */
export async function recordGroupResponse(
  anchorName: string,
  email: string,
  attendance: AttendanceEntry[]
): Promise<{ recorded: number }> {
  const { sheet, cols } = await getGuestSheet();

  const header = sheet.headerValues ?? [];
  const missing = RESPONSE_COLS.filter((c) => !header.some((h) => headerKey(h) === headerKey(c)));
  if (missing.length > 0) {
    await sheet.setHeaderRow([...header, ...missing]);
  }

  const rows = await sheet.getRows();
  const anchorRow = rows.find(
    (r) => normalizeName(String(r.get(cols.name) ?? "")) === normalizeName(anchorName)
  );
  if (!anchorRow) throw new Error("Anchor guest not found");
  const groupId = String(anchorRow.get(cols.groupId) ?? "").trim();

  const attMap = new Map(attendance.map((a) => [normalizeName(a.name), a.attending]));
  const timestamp = new Date().toISOString();

  let recorded = 0;
  for (const r of rows) {
    if (String(r.get(cols.groupId) ?? "").trim() !== groupId) continue;
    const nm = normalizeName(String(r.get(cols.name) ?? ""));
    if (!attMap.has(nm)) continue;
    r.set("RSVP_Status", attMap.get(nm) ? "Attending" : "Declined");
    r.set("RSVP_Email", email);
    r.set("RSVP_Timestamp", timestamp);
    await r.save();
    recorded++;
  }

  listCache = null; // responses changed the sheet
  return { recorded };
}
