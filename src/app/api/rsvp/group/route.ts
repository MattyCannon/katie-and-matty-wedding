import { NextRequest, NextResponse } from "next/server";
import { recordGroupResponse } from "@/lib/guests";
import { RsvpNotConfiguredError } from "@/lib/googleSheet";
import { EMAIL_RE, type AttendanceEntry } from "@/lib/guestTypes";

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
    const { recorded } = await recordGroupResponse(anchorName, email, attendance);
    return NextResponse.json({ ok: true, recorded });
  } catch (err) {
    if (err instanceof RsvpNotConfiguredError) {
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }
    console.error("[RSVP] group submit failed:", err);
    return NextResponse.json({ error: "submit_failed" }, { status: 502 });
  }
}
