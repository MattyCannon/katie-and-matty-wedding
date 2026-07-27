/**
 * EDIT ME — the wording of the RSVP confirmation email.
 *
 * Plain text on purpose: it's short, it renders identically everywhere, and it
 * won't trip spam filters the way a styled HTML template can. Arrival times come
 * from `wedding.arrivals`, so they can't drift from what the website shows.
 */
import { wedding } from "@/lib/wedding";
import type { RecordedMember } from "@/lib/guests";

export function buildRsvpEmail(members: RecordedMember[]): { subject: string; text: string } {
  const coming = members.filter((m) => m.attending);
  const notComing = members.filter((m) => !m.attending);

  const subject = coming.length
    ? `Thank you — your RSVP for ${wedding.names.one} & ${wedding.names.two}'s wedding`
    : `Thank you for letting us know — ${wedding.names.one} & ${wedding.names.two}`;

  const lines: string[] = [];

  lines.push(
    coming.length
      ? "Thank you — we've got your RSVP and we can't wait to celebrate with you."
      : "Thank you for letting us know. We're sorry you can't make it — you'll be very missed."
  );
  lines.push("");

  if (coming.length) {
    lines.push("Coming:");
    for (const m of coming) {
      const a = m.ceremonyGuest ? wedding.arrivals.ceremony : wedding.arrivals.evening;
      lines.push(`  - ${m.name} — ${a.label}, from ${a.arriveFrom}`);
    }
    lines.push("");
  }

  if (notComing.length) {
    lines.push(coming.length ? "Sadly can't make it:" : "Can't make it:");
    for (const m of notComing) lines.push(`  - ${m.name}`);
    lines.push("");
  }

  if (coming.length) {
    lines.push(wedding.date.full);
    lines.push(wedding.address.full);
    lines.push("");
  }

  lines.push("If anything changes, just reply to this email and let us know.");
  lines.push("");
  lines.push(`With love,`);
  lines.push(`${wedding.names.one} & ${wedding.names.two}`);

  return { subject, text: lines.join("\n") };
}
