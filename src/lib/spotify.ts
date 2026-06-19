/**
 * Server-only Spotify client for the "Request a Song" feature.
 *
 * Uses the playlist owner's refresh token for everything (search + add), so
 * guests never log into Spotify. Required env vars (see README → "Spotify song
 * requests setup"):
 *   SPOTIFY_CLIENT_ID
 *   SPOTIFY_CLIENT_SECRET
 *   SPOTIFY_REFRESH_TOKEN   — obtained once via scripts/spotify-auth.mjs
 *   SPOTIFY_PLAYLIST_ID    — the central playlist tracks are added to
 */

export type Track = {
  id: string;
  uri: string;
  name: string;
  artists: string;
  album: string;
  image: string | null;
  url: string | null;
};

export type AddResult = { added: boolean; reason?: "duplicate" };

/** Thrown when the Spotify env vars are missing, so callers can degrade nicely. */
export class SpotifyNotConfiguredError extends Error {
  constructor() {
    super("Spotify is not configured");
    this.name = "SpotifyNotConfiguredError";
  }
}

const TRACK_URI_RE = /^spotify:track:[A-Za-z0-9]+$/;

function getConfig() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
  if (!clientId || !clientSecret || !refreshToken || !playlistId) {
    throw new SpotifyNotConfiguredError();
  }
  return { clientId, clientSecret, refreshToken, playlistId };
}

/** Cached access token (valid within a single serverless instance). */
let cached: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const { clientId, clientSecret, refreshToken } = getConfig();
  if (cached && Date.now() < cached.expiresAt - 60_000) {
    return cached.token;
  }
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Spotify token refresh failed (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return cached.token;
}

type SpotifyImage = { url: string; width: number | null; height: number | null };

/** Pick the smallest album image (we only render a thumbnail). */
function smallestImage(images: SpotifyImage[] | undefined): string | null {
  if (!images || images.length === 0) return null;
  return images[images.length - 1]?.url ?? images[0]?.url ?? null;
}

export async function searchTracks(query: string, limit = 8): Promise<Track[]> {
  const token = await getAccessToken();
  const url =
    "https://api.spotify.com/v1/search?type=track&limit=" +
    limit +
    "&q=" +
    encodeURIComponent(query);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Spotify search failed (${res.status}): ${await res.text()}`);
  }
  const json = await res.json();
  const items = json?.tracks?.items ?? [];
  return items.map(
    (t: {
      id: string;
      uri: string;
      name: string;
      artists: { name: string }[];
      album: { name: string; images: SpotifyImage[] };
      external_urls?: { spotify?: string };
    }): Track => ({
      id: t.id,
      uri: t.uri,
      name: t.name,
      artists: t.artists.map((a) => a.name).join(", "),
      album: t.album?.name ?? "",
      image: smallestImage(t.album?.images),
      url: t.external_urls?.spotify ?? null,
    })
  );
}

/** Collect every track URI already on the playlist (paginated), for dedupe. */
async function getPlaylistTrackUris(token: string, playlistId: string): Promise<Set<string>> {
  const uris = new Set<string>();
  let url: string | null =
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100&fields=items(track(uri)),next`;
  while (url) {
    const res: Response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Spotify playlist read failed (${res.status}): ${await res.text()}`);
    }
    const json: { items: { track: { uri?: string } | null }[]; next: string | null } =
      await res.json();
    for (const item of json.items) {
      if (item.track?.uri) uris.add(item.track.uri);
    }
    url = json.next;
  }
  return uris;
}

export async function addTrackToPlaylist(uri: string): Promise<AddResult> {
  if (!TRACK_URI_RE.test(uri)) {
    throw new Error("Invalid track URI");
  }
  const { playlistId } = getConfig();
  const token = await getAccessToken();

  // Dedupe so the same song can't be piled on.
  const existing = await getPlaylistTrackUris(token, playlistId);
  if (existing.has(uri)) {
    return { added: false, reason: "duplicate" };
  }

  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uris: [uri] }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Spotify add failed (${res.status}): ${await res.text()}`);
  }
  return { added: true };
}
