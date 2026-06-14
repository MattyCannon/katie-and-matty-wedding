/**
 * RSVP types, validation and the Google Sheet column order.
 * Pure module (no server-only imports) so the client form can share the types.
 */

export type Attending = "yes" | "no" | "";

export type RsvpValues = {
  name: string;
  email: string;
  attending: Attending;
  guests: string; // kept as a string straight from the form
  guestNames: string;
};

export type RsvpErrors = Partial<Record<keyof RsvpValues, string>>;

export type RsvpState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: RsvpErrors;
  /** Echoed back so the form can repopulate after a failed submit. */
  values?: RsvpValues;
};

export const MAX_GUESTS = 10;

/** Column order written to the Sheet (and used to seed the header row). */
export const SHEET_HEADERS = [
  "Timestamp",
  "Name",
  "Email",
  "Attending",
  "Guests",
  "Guest names",
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRsvp(v: RsvpValues): RsvpErrors {
  const errors: RsvpErrors = {};

  if (!v.name || v.name.length < 2) {
    errors.name = "Please tell us your name.";
  } else if (v.name.length > 100) {
    errors.name = "That name looks a little long.";
  }

  if (!v.email) {
    errors.email = "Please add an email so we can reach you.";
  } else if (!EMAIL_RE.test(v.email)) {
    errors.email = "That doesn't look like a valid email.";
  }

  if (v.attending !== "yes" && v.attending !== "no") {
    errors.attending = "Please let us know if you can make it.";
  }

  if (v.attending === "yes") {
    const n = Number(v.guests);
    if (!v.guests || !Number.isInteger(n) || n < 1 || n > MAX_GUESTS) {
      errors.guests = `Please choose between 1 and ${MAX_GUESTS} guests.`;
    }
  }

  return errors;
}
