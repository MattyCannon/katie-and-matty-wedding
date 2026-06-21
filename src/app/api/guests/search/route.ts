import { NextRequest, NextResponse } from "next/server";
import { searchGuestNames } from "@/lib/guests";
import { RsvpNotConfiguredError } from "@/lib/googleSheet";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ matches: [] });
  }
  try {
    const matches = await searchGuestNames(q);
    return NextResponse.json({ matches });
  } catch (err) {
    if (err instanceof RsvpNotConfiguredError) {
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }
    console.error("[Guests] search failed:", err);
    return NextResponse.json({ error: "search_failed" }, { status: 502 });
  }
}
