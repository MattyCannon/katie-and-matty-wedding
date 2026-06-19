import { NextRequest, NextResponse } from "next/server";
import { addTrackToPlaylist, SpotifyNotConfiguredError } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { uri?: unknown; company?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // Honeypot — bots fill hidden fields. Pretend success.
  if (typeof body.company === "string" && body.company.trim()) {
    return NextResponse.json({ added: true });
  }

  const uri = typeof body.uri === "string" ? body.uri : "";
  if (!/^spotify:track:[A-Za-z0-9]+$/.test(uri)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const result = await addTrackToPlaylist(uri);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof SpotifyNotConfiguredError) {
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }
    console.error("[Spotify] add failed:", err);
    return NextResponse.json({ error: "add_failed" }, { status: 502 });
  }
}
