/**
 * One-time helper to obtain a Spotify refresh token for the playlist owner.
 *
 * Prereqs:
 *   1. Create a Spotify app at https://developer.spotify.com/dashboard
 *   2. Add this redirect URI to the app: http://127.0.0.1:8888/callback
 *   3. Put SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local (or export them)
 *
 * Run:  node scripts/spotify-auth.mjs
 * Then open the printed URL, approve, and copy the refresh token it prints into
 * .env.local as SPOTIFY_REFRESH_TOKEN (and set SPOTIFY_PLAYLIST_ID too).
 */
import http from "node:http";
import fs from "node:fs";
import crypto from "node:crypto";

const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = "playlist-modify-public playlist-modify-private";

function loadEnv() {
  const env = { ...process.env };
  try {
    const raw = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      let v = m[2];
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      if (env[m[1]] === undefined) env[m[1]] = v;
    }
  } catch {
    /* no .env.local yet — rely on process.env */
  }
  return env;
}

const env = loadEnv();
const clientId = env.SPOTIFY_CLIENT_ID;
const clientSecret = env.SPOTIFY_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error("Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET.");
  console.error("Add them to .env.local (or export them) and re-run.");
  process.exit(1);
}

const state = crypto.randomUUID();
const authUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
  }).toString();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname !== "/callback") {
    res.writeHead(404);
    res.end();
    return;
  }
  const code = url.searchParams.get("code");
  if (!code || url.searchParams.get("state") !== state) {
    res.writeHead(400, { "Content-Type": "text/html" });
    res.end("<h1>Authorization failed</h1><p>Close this tab and re-run the script.</p>");
    return;
  }
  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });
    const json = await tokenRes.json();
    if (!tokenRes.ok || !json.refresh_token) {
      res.writeHead(500, { "Content-Type": "text/html" });
      res.end("<h1>Token exchange failed</h1><p>Check the terminal.</p>");
      console.error("Token exchange failed:", json);
      server.close();
      process.exit(1);
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h1>All done 🌼</h1><p>Your refresh token is in the terminal. You can close this tab.</p>");
    console.log("\n=== SPOTIFY_REFRESH_TOKEN ===\n" + json.refresh_token + "\n=============================\n");
    console.log("Add it to .env.local as SPOTIFY_REFRESH_TOKEN, and set SPOTIFY_PLAYLIST_ID too.");
    server.close();
    process.exit(0);
  } catch (e) {
    console.error(e);
    res.writeHead(500);
    res.end("error");
    server.close();
    process.exit(1);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("\n1) Confirm your Spotify app lists this redirect URI:");
  console.log("   " + REDIRECT_URI);
  console.log("\n2) Open this URL in your browser and approve:\n");
  console.log("   " + authUrl + "\n");
  console.log("Waiting for the redirect on " + REDIRECT_URI + " …");
});
