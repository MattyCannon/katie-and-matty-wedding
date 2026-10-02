import { NextRequest, NextResponse } from "next/server";
import { addTrackToPlaylist, SpotifyNotConfiguredError } from "@/lib/spotify";
import { SONG_LIMIT_COOKIE, SONG_LIMIT_MAX_AGE } from "@/lib/songLimit";

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

  // One song per guest. Guests have no login, so this is per browser: a cookie
  // set after a successful add. Checked before touching Spotify at all.
  if (req.cookies.get(SONG_LIMIT_COOKIE)) {
    return NextResponse.json({ error: "limit_reached" }, { status: 409 });
  }

  const uri = typeof body.uri === "string" ? body.uri : "";
  if (!/^spotify:track:[A-Za-z0-9]+$/.test(uri)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const result = await addTrackToPlaylist(uri);
    const res = NextResponse.json(result);
    // Only a track that actually went onto the playlist uses up the request. A
    // duplicate added nothing, so that guest is free to pick another song.
    if (result.added) {
      res.cookies.set(SONG_LIMIT_COOKIE, "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: SONG_LIMIT_MAX_AGE,
      });
    }
    return res;
  } catch (err) {
    if (err instanceof SpotifyNotConfiguredError) {
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }
    console.error("[Spotify] add failed:", err);
    return NextResponse.json({ error: "add_failed" }, { status: 502 });
  }
}
