/**
 * Server-only Google Sheets client. Appends RSVP rows using a service account.
 *
 * Required env vars (see README → "RSVP / Google Sheets setup"):
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL  — the service account's client_email
 *   GOOGLE_PRIVATE_KEY            — its private_key (keep the \n escapes)
 *   GOOGLE_SHEET_ID              — the id from the Sheet's URL
 */
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { SHEET_HEADERS } from "@/lib/rsvp";

/** Thrown when the Google env vars are missing, so the action can explain nicely. */
export class RsvpNotConfiguredError extends Error {
  constructor() {
    super("Google Sheets is not configured");
    this.name = "RsvpNotConfiguredError";
  }
}

function getConfig() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!email || !key || !sheetId) {
    throw new RsvpNotConfiguredError();
  }
  // Env vars store the key with literal "\n"; restore real newlines.
  return { email, key: key.replace(/\\n/g, "\n"), sheetId };
}

export type RsvpRow = Record<(typeof SHEET_HEADERS)[number], string | number>;

export async function appendRsvpRow(row: RsvpRow): Promise<void> {
  const { email, key, sheetId } = getConfig();

  const jwt = new JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(sheetId, jwt);
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];

  // Seed the header row on first use so columns stay aligned.
  await sheet.loadHeaderRow().catch(() => undefined);
  if (!sheet.headerValues || sheet.headerValues.length === 0) {
    await sheet.setHeaderRow([...SHEET_HEADERS]);
  }

  await sheet.addRow(row);
}
