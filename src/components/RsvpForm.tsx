"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EMAIL_RE, type GuestMember } from "@/lib/guestTypes";
import { Divider } from "@/components/botanical/Divider";
import { arrivalCalendarLinks, wedding } from "@/lib/wedding";

type Stage = "search" | "group" | "done";

/**
 * What one kind of guest is invited to, when to arrive, and calendar links with
 * the right start time. `names` is only passed for mixed parties, where it's
 * useful to say who this block applies to.
 */
function ArrivalCard({
  kind,
  names,
}: {
  kind: "ceremony" | "evening";
  names: string[];
}) {
  const a = wedding.arrivals[kind];
  const links = arrivalCalendarLinks(kind);

  return (
    <div className="rounded-lg border border-sage/40 bg-ivory px-5 py-5">
      <p className="label text-[0.62rem] text-botanical-red">{a.label}</p>

      {names.length > 0 && (
        <p className="mt-2 font-body text-sm text-ink-soft">
          For {names.join(" & ")}
        </p>
      )}

      <p className="mt-2 font-body text-lg text-ink">{a.blurb}</p>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-body">
        <a className="info-link" href={links.google} target="_blank" rel="noopener noreferrer">
          Google Calendar
        </a>
        <a className="info-link" href={links.outlook} target="_blank" rel="noopener noreferrer">
          Outlook
        </a>
        <a className="info-link" href={links.ics} download>
          Apple Calendar / Other
        </a>
      </div>
    </div>
  );
}

export default function RsvpForm() {
  const [stage, setStage] = useState<Stage>("search");
  const [comingSoon, setComingSoon] = useState(false);

  // search
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  // selected group
  const [anchorName, setAnchorName] = useState("");
  const [members, setMembers] = useState<GuestMember[]>([]);
  const [attending, setAttending] = useState<Record<string, boolean>>({});
  const [email, setEmail] = useState("");

  // submit
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const honeypot = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (stage !== "search") return;
    const q = query.trim();
    if (q.length < 2) {
      setMatches([]);
      setSearched(false);
      return;
    }
    setSearching(true);
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/guests/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (res.status === 503) {
          setComingSoon(true);
          return;
        }
        const data = await res.json();
        setMatches(data.matches ?? []);
        setSearched(true);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setMatches([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [query, stage]);

  async function selectName(name: string) {
    try {
      const res = await fetch(`/api/guests/group?name=${encodeURIComponent(name)}`);
      if (res.status === 503) {
        setComingSoon(true);
        return;
      }
      const data = await res.json();
      if (!data.found || !data.members?.length) {
        setError("Sorry — we couldn't find that name. Please try again.");
        return;
      }
      setAnchorName(name);
      setMembers(data.members);
      setAttending(Object.fromEntries(data.members.map((m: GuestMember) => [m.name, true])));
      setError(null);
      setStage("group");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  function reset() {
    setStage("search");
    setQuery("");
    setMatches([]);
    setSearched(false);
    setAnchorName("");
    setMembers([]);
    setAttending({});
    setEmail("");
    setError(null);
    setEmailError(false);
  }

  async function submit() {
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/rsvp/group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anchorName,
          email: email.trim(),
          attendance: members.map((m) => ({ name: m.name, attending: !!attending[m.name] })),
          company: honeypot.current?.value ?? "",
        }),
      });
      if (res.status === 503) {
        setComingSoon(true);
        return;
      }
      if (!res.ok) {
        setError("Sorry — we couldn't save your RSVP just now. Please try again in a moment.");
        return;
      }
      const anyComing = members.some((m) => attending[m.name]);
      setSuccessMsg(
        anyComing
          ? "We can't wait to celebrate with you!"
          : "Thank you for letting us know — you'll be very missed."
      );
      setStage("done");
    } catch {
      setError("Sorry — something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (comingSoon) {
    return (
      <div className="rounded-lg border border-sage/50 bg-ivory/60 px-6 py-12 text-center">
        <p className="font-display text-3xl text-ink">RSVPs open soon</p>
        <p className="mx-auto mt-3 max-w-sm font-body text-lg text-ink-soft">
          We&apos;re just finishing the guest list — do check back shortly.
        </p>
      </div>
    );
  }

  if (stage === "done") {
    // Only tell people about timings if they're actually coming. A party can be
    // mixed (one ceremony guest, one evening guest), so group the attendees by
    // invite type and show a block for each type that's present.
    const comingCeremony = members.filter((m) => attending[m.name] && m.ceremonyGuest);
    const comingEvening = members.filter((m) => attending[m.name] && !m.ceremonyGuest);
    const mixed = comingCeremony.length > 0 && comingEvening.length > 0;

    return (
      <div className="rounded-lg border border-sage/50 bg-ivory/60 px-6 py-12 text-center">
        <Divider className="mx-auto h-8 w-44" />
        <p className="mt-6 font-display text-3xl text-ink sm:text-4xl">With thanks</p>
        <p className="mx-auto mt-3 max-w-sm font-body text-lg text-ink-soft">{successMsg}</p>

        {(comingCeremony.length > 0 || comingEvening.length > 0) && (
          <div className="mx-auto mt-8 max-w-md space-y-6 text-left">
            {comingCeremony.length > 0 && (
              <ArrivalCard
                kind="ceremony"
                names={mixed ? comingCeremony.map((m) => m.name) : []}
              />
            )}
            {comingEvening.length > 0 && (
              <ArrivalCard
                kind="evening"
                names={mixed ? comingEvening.map((m) => m.name) : []}
              />
            )}
          </div>
        )}

        <p className="mt-8 font-body text-lg text-ink-soft">
          While you&apos;re here —{" "}
          <Link href="/songs" className="info-link">
            add a song to get us dancing
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="text-left">
      {/* Honeypot */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input ref={honeypot} type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-6 rounded-md border border-botanical-red/40 bg-botanical-red/5 px-4 py-3 font-body text-botanical-red"
        >
          {error}
        </p>
      )}

      {stage === "search" && (
        <div>
          <label htmlFor="guest-search" className="field-label">
            Find your name
          </label>
          <input
            id="guest-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="field-input"
            placeholder="Start typing your name…"
            autoComplete="off"
          />

          <div className="mt-3 min-h-[1.5rem]">
            {searching && <p className="font-body text-ink-soft">Searching…</p>}

            {matches.length > 0 && (
              <ul className="overflow-hidden rounded-lg border border-sage/40 bg-ivory/60">
                {matches.map((name) => (
                  <li key={name} className="border-b border-sage/20 last:border-b-0">
                    <button type="button" className="suggestion-btn" onClick={() => selectName(name)}>
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {!searching && searched && matches.length === 0 && (
              <p className="font-body text-ink-soft">
                We couldn&apos;t find that name on the guest list.
              </p>
            )}
          </div>

          <p className="mt-6 font-body text-sm text-ink-soft">
            Can&apos;t find your name? Please get in touch with us directly and we&apos;ll
            sort it out.
          </p>
        </div>
      )}

      {stage === "group" && (
        <div>
          <button
            type="button"
            onClick={reset}
            className="label text-[0.62rem] text-ink-soft transition-colors hover:text-botanical-red"
          >
            ← Search again
          </button>

          <p className="mt-5 font-body text-lg text-ink-soft">
            Lovely to see you, {anchorName.trim()}. Please let us know who can make it:
          </p>

          <ul className="mt-5 space-y-3">
            {members.map((m) => {
              const yes = !!attending[m.name];
              return (
                <li
                  key={m.name}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sage/40 bg-ivory/50 p-4"
                >
                  <div className="min-w-0">
                    <p className="font-display text-xl text-ink">{m.name.trim()}</p>
                    <p className="label text-[0.55rem] text-sage">
                      {m.ceremonyGuest
                        ? wedding.arrivals.ceremony.label
                        : wedding.arrivals.evening.label}
                    </p>
                  </div>
                  <div className="flex gap-2" role="group" aria-label={`Attendance for ${m.name.trim()}`}>
                    <button
                      type="button"
                      aria-pressed={yes}
                      onClick={() => setAttending((s) => ({ ...s, [m.name]: true }))}
                      className={
                        "rounded-full border px-4 py-2 font-display text-[0.62rem] uppercase tracking-[0.14em] transition-colors " +
                        (yes ? "border-forest bg-forest text-ivory" : "border-sage/60 text-ink-soft hover:border-forest")
                      }
                    >
                      Coming
                    </button>
                    <button
                      type="button"
                      aria-pressed={!yes}
                      onClick={() => setAttending((s) => ({ ...s, [m.name]: false }))}
                      className={
                        "rounded-full border px-4 py-2 font-display text-[0.62rem] uppercase tracking-[0.14em] transition-colors " +
                        (!yes
                          ? "border-botanical-red bg-botanical-red text-ivory"
                          : "border-sage/60 text-ink-soft hover:border-botanical-red")
                      }
                    >
                      Can&apos;t make it
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-6">
            <label htmlFor="group-email" className="field-label">
              Contact email
            </label>
            <input
              id="group-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input"
              placeholder="you@example.com"
              aria-invalid={emailError ? "true" : undefined}
            />
            {emailError && <p className="field-error">Please add a valid email so we can reach you.</p>}
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="btn mt-8 w-full disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send RSVP"}
          </button>
        </div>
      )}
    </div>
  );
}
