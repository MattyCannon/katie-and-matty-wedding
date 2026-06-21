/**
 * Shared (client-safe) types for the guest-list RSVP flow.
 * No server-only imports here, so the client form can use these too.
 */

export type GuestMember = {
  name: string;
  /** Ceremony_Guest = "Yes" on the guest list (vs evening-only). */
  ceremonyGuest: boolean;
};

export type SearchResponse = { matches: string[] };

export type GroupResponse = { found: boolean; members: GuestMember[] };

export type AttendanceEntry = { name: string; attending: boolean };

export type GroupSubmission = {
  anchorName: string;
  email: string;
  attendance: AttendanceEntry[];
  /** Honeypot — must be empty for real people. */
  company?: string;
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normalise a name for matching: trim, collapse spaces, lowercase. */
export function normalizeName(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}
