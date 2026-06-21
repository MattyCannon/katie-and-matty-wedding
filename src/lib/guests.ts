/**
 * Server-only guest-list logic, backed by the SECOND tab of the RSVP sheet.
 *
 * Expected columns on that tab: Group_ID, Name, Ceremony_Guest, Food_Order.
 * RSVP responses are written back onto the same tab in these columns (created
 * automatically on first response): RSVP_Status, RSVP_Email, RSVP_Timestamp.
 */
import { getDoc } from "@/lib/googleSheet";
import { normalizeName, type GuestMember, type AttendanceEntry } from "@/lib/guestTypes";

/** The guest list lives on the second tab. */
const GUEST_TAB_INDEX = 1;
const RESPONSE_COLS = ["RSVP_Status", "RSVP_Email", "RSVP_Timestamp"] as const;

type GuestRow = { groupId: string; name: string; ceremonyGuest: boolean };

/** Short-lived cache so autocomplete doesn't hit the Sheets API on every keystroke. */
let listCache: { rows: GuestRow[]; at: number } | null = null;
const LIST_TTL_MS = 60_000;

async function loadGuestRows(): Promise<GuestRow[]> {
  const doc = await getDoc();
  const sheet = doc.sheetsByIndex[GUEST_TAB_INDEX];
  if (!sheet) throw new Error("Guest-list tab (second sheet) not found");
  await sheet.loadHeaderRow();
  const rows = await sheet.getRows();
  return rows
    .map((r) => ({
      groupId: String(r.get("Group_ID") ?? "").trim(),
      name: String(r.get("Name") ?? "").trim(),
      ceremonyGuest: String(r.get("Ceremony_Guest") ?? "").trim().toLowerCase() === "yes",
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

/** Everyone sharing the selected guest's Group_ID. */
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
  const doc = await getDoc();
  const sheet = doc.sheetsByIndex[GUEST_TAB_INDEX];
  if (!sheet) throw new Error("Guest-list tab (second sheet) not found");

  await sheet.loadHeaderRow();
  const header = sheet.headerValues ?? [];
  const missing = RESPONSE_COLS.filter((c) => !header.includes(c));
  if (missing.length > 0) {
    await sheet.setHeaderRow([...header, ...missing]);
  }

  const rows = await sheet.getRows();
  const anchorRow = rows.find((r) => normalizeName(String(r.get("Name") ?? "")) === normalizeName(anchorName));
  if (!anchorRow) throw new Error("Anchor guest not found");
  const groupId = String(anchorRow.get("Group_ID") ?? "").trim();

  const attMap = new Map(attendance.map((a) => [normalizeName(a.name), a.attending]));
  const timestamp = new Date().toISOString();

  let recorded = 0;
  for (const r of rows) {
    if (String(r.get("Group_ID") ?? "").trim() !== groupId) continue;
    const nm = normalizeName(String(r.get("Name") ?? ""));
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
