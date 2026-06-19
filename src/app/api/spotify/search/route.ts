import { NextRequest, NextResponse } from "next/server";
import { searchTracks, SpotifyNotConfiguredError } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ tracks: [] });
  }
  try {
    const tracks = await searchTracks(q);
    return NextResponse.json({ tracks });
  } catch (err) {
    if (err instanceof SpotifyNotConfiguredError) {
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }
    console.error("[Spotify] search failed:", err);
    return NextResponse.json({ error: "search_failed" }, { status: 502 });
  }
}
