"use client";

import { useEffect, useRef, useState } from "react";
import type { Track } from "@/lib/spotify";

type AddState = "idle" | "adding" | "added" | "duplicate" | "error";

export default function SongRequest() {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [addState, setAddState] = useState<Record<string, AddState>>({});
  const honeypot = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setTracks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (res.status === 503) {
          setComingSoon(true);
          setTracks([]);
          return;
        }
        if (!res.ok) {
          setSearchError(true);
          setTracks([]);
          return;
        }
        const data = await res.json();
        setComingSoon(false);
        setSearchError(false);
        setTracks(data.tracks ?? []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setSearchError(true);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [query]);

  async function add(track: Track) {
    setAddState((s) => ({ ...s, [track.id]: "adding" }));
    try {
      const res = await fetch("/api/spotify/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uri: track.uri, company: honeypot.current?.value ?? "" }),
      });
      if (res.status === 503) {
        setComingSoon(true);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAddState((s) => ({ ...s, [track.id]: "error" }));
        return;
      }
      setAddState((s) => ({
        ...s,
        [track.id]: data.reason === "duplicate" ? "duplicate" : "added",
      }));
    } catch {
      setAddState((s) => ({ ...s, [track.id]: "error" }));
    }
  }

  if (comingSoon) {
    return (
      <div className="rounded-lg border border-sage/50 bg-ivory/60 px-6 py-12 text-center">
        <p className="font-display text-3xl text-ink">Song requests open soon</p>
        <p className="mx-auto mt-3 max-w-sm font-body text-lg text-ink-soft">
          We&apos;re still tuning the playlist — do check back nearer the day.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Honeypot */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input ref={honeypot} type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label htmlFor="song-search" className="field-label">
        Search for a song
      </label>
      <input
        id="song-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="field-input"
        placeholder="Song or artist…"
        autoComplete="off"
      />

      <div className="mt-5 min-h-[2rem]">
        {loading && <p className="font-body text-ink-soft">Searching…</p>}

        {searchError && !loading && (
          <p className="font-body text-botanical-red">
            Hmm, search hiccuped — please try again.
          </p>
        )}

        {!loading && !searchError && query.trim().length >= 2 && tracks.length === 0 && (
          <p className="font-body text-ink-soft">No songs found — try another search.</p>
        )}

        <ul className="space-y-3">
          {tracks.map((track) => {
            const state = addState[track.id] ?? "idle";
            const done = state === "added" || state === "duplicate";
            return (
              <li
                key={track.id}
                className="flex items-center gap-4 rounded-lg border border-sage/40 bg-ivory/50 p-3"
              >
                {track.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={track.image}
                    alt=""
                    width={52}
                    height={52}
                    className="h-13 w-13 shrink-0 rounded"
                    style={{ width: 52, height: 52 }}
                  />
                ) : (
                  <div className="h-[52px] w-[52px] shrink-0 rounded bg-sage/20" />
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-xl text-ink">{track.name}</p>
                  <p className="truncate font-body text-sm text-ink-soft">{track.artists}</p>
                </div>

                <button
                  type="button"
                  onClick={() => add(track)}
                  disabled={state === "adding" || done}
                  className="btn shrink-0 disabled:opacity-70"
                >
                  {state === "adding"
                    ? "Adding…"
                    : state === "added"
                      ? "Added ✓"
                      : state === "duplicate"
                        ? "Already in 🎵"
                        : state === "error"
                          ? "Try again"
                          : "Add"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
