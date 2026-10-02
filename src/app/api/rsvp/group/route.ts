import { NextRequest, NextResponse } from "next/server";
import { recordGroupResponse } from "@/lib/guests";
import { RsvpNotConfiguredError } from "@/lib/googleSheet";
import { EMAIL_RE, type AttendanceEntry } from "@/lib/guestTypes";
import { sendEmail } from "@/lib/email";
import { buildRsvpEmail } from "@/lib/rsvpEmail";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: {
    anchorName?: unknown;
    email?: unknown;
    attendance?: unknown;
    company?: unknown;
  } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // Honeypot — pretend success.
  if (typeof body.company === "string" && body.company.trim()) {
    return NextResponse.json({ ok: true, recorded: 0 });
  }

  const anchorName = typeof body.anchorName === "string" ? body.anchorName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const rawAttendance = Array.isArray(body.attendance) ? body.attendance : [];

  if (!anchorName) {
    return NextResponse.json({ error: "missing_name" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "bad_email" }, { status: 400 });
  }
  const attendance: AttendanceEntry[] = rawAttendance
    .filter(
      (a): a is { name: string; attending: boolean } =>
        a && typeof a.name === "string" && typeof a.attending === "boolean"
    )
    .map((a) => ({ name: a.name.trim(), attending: a.attending }))
    .slice(0, 30);

  if (attendance.length === 0) {
    return NextResponse.json({ error: "no_attendance" }, { status: 400 });
  }

  try {
    const { recorded, members } = await recordGroupResponse(anchorName, email, attendance);

    // Confirmation email is best-effort: the RSVP is already safely on the sheet,
    // so a mail failure must never surface as a failed submission.
    try {
      const { subject, text } = buildRsvpEmail(members);
      const result = await sendEmail({ to: email, subject, text });
      if (!result.sent && !result.skipped) {
        console.error("[RSVP] confirmation email failed:", result.error);
      }
    } catch (mailErr) {
      console.error("[RSVP] confirmation email threw:", mailErr);
    }

    return NextResponse.json({ ok: true, recorded });
  } catch (err) {
    if (err instanceof RsvpNotConfiguredError) {
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }
    console.error("[RSVP] group submit failed:", err);
    return NextResponse.json({ error: "submit_failed" }, { status: 502 });
  }
}
