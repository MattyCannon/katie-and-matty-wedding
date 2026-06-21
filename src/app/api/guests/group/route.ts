import { NextRequest, NextResponse } from "next/server";
import { resolveGroup } from "@/lib/guests";
import { RsvpNotConfiguredError } from "@/lib/googleSheet";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const name = (req.nextUrl.searchParams.get("name") ?? "").trim();
  if (!name) {
    return NextResponse.json({ found: false, members: [] });
  }
  try {
    const result = await resolveGroup(name);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof RsvpNotConfiguredError) {
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }
    console.error("[Guests] group resolve failed:", err);
    return NextResponse.json({ error: "resolve_failed" }, { status: 502 });
  }
}
