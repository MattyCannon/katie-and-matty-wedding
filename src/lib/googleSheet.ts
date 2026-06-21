/**
 * Server-only Google Sheets access. Provides an authenticated spreadsheet
 * document; guest-list reads/writes live in src/lib/guests.ts.
 *
 * Required env vars (see README → "RSVP / Google Sheets setup"):
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID
 */
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

/** Thrown when the Google env vars are missing, so callers can degrade nicely. */
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

/** Returns an authenticated, loaded spreadsheet document. */
export async function getDoc(): Promise<GoogleSpreadsheet> {
  const { email, key, sheetId } = getConfig();
  const jwt = new JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const doc = new GoogleSpreadsheet(sheetId, jwt);
  await doc.loadInfo();
  return doc;
}
