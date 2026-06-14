"use server";

import { validateRsvp, type RsvpState, type RsvpValues } from "@/lib/rsvp";
import { appendRsvpRow, RsvpNotConfiguredError } from "@/lib/googleSheet";

function str(formData: FormData, key: string): string {
  return ((formData.get(key) as string | null) ?? "").trim();
}

export async function submitRsvp(
  _prev: RsvpState,
  formData: FormData
): Promise<RsvpState> {
  // Honeypot: bots tend to fill every field. Silently "succeed".
  if (str(formData, "company")) {
    return { status: "success", message: "Thank you — your RSVP has been received." };
  }

  const values: RsvpValues = {
    name: str(formData, "name"),
    email: str(formData, "email"),
    attending: str(formData, "attending") as RsvpValues["attending"],
    guests: str(formData, "guests"),
    guestNames: str(formData, "guestNames"),
  };

  const errors = validateRsvp(values);
  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      errors,
      values,
      message: "Please check the highlighted fields.",
    };
  }

  const attendingYes = values.attending === "yes";

  try {
    await appendRsvpRow({
      Timestamp: new Date().toISOString(),
      Name: values.name,
      Email: values.email,
      Attending: attendingYes ? "Yes" : "No",
      Guests: attendingYes ? Number(values.guests) : 0,
      "Guest names": attendingYes ? values.guestNames : "",
    });
  } catch (err) {
    if (err instanceof RsvpNotConfiguredError) {
      console.error(
        "[RSVP] Google Sheets is not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL, " +
          "GOOGLE_PRIVATE_KEY and GOOGLE_SHEET_ID (see README → RSVP / Google Sheets setup)."
      );
    } else {
      console.error("[RSVP] Failed to append row to the Sheet:", err);
    }
    return {
      status: "error",
      values,
      message:
        "Sorry — we couldn't save your RSVP just now. Please try again in a moment.",
    };
  }

  return {
    status: "success",
    message: attendingYes
      ? "Thank you — we can't wait to celebrate with you!"
      : "Thank you for letting us know — you'll be very missed.",
  };
}
