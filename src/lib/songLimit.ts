/**
 * "One song per guest" settings, shared by the add route (enforces it) and the
 * Songs page (remembers which song was picked so it can say so on a return visit).
 *
 * Guests don't log in, so the limit is per browser: a cookie set by the server
 * once a song is genuinely added. Clearing cookies or switching browser gets
 * around it — fine for a light-hearted feature, but not a hard guarantee.
 */
export const SONG_LIMIT_COOKIE = "song_requested";

/** About a year — comfortably past the wedding. */
export const SONG_LIMIT_MAX_AGE = 60 * 60 * 24 * 365;

/** localStorage key for the song this browser picked (display only; the cookie enforces). */
export const SONG_PICKED_STORAGE_KEY = "kmw_song_picked";

export type PickedSong = { name: string; artists: string };
