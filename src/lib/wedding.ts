/**
 * Single source of truth for the event details.
 * Update here (and CLAUDE.md) if anything changes — the UI reads from this.
 */
export const wedding = {
  names: {
    one: "Katie",
    two: "Matty",
  },
  /** Machine-readable date (ISO) for <time> elements. */
  isoDate: "2027-06-04",
  date: {
    weekday: "Friday",
    day: "4th",
    month: "June",
    year: "2027",
    /** Display form, e.g. for the hero. */
    full: "Friday 4th June 2027",
  },
  time: {
    label: "2:00 pm",
    words: "Two o'clock in the afternoon",
  },
  venue: "The Hospitium",
  location: {
    area: "Museum Gardens",
    city: "York",
    country: "England",
    full: "Museum Gardens, York",
  },
  /** Full postal address — used for the map and calendar entries. EDIT if needed. */
  address: {
    full: "The Hospitium, Museum Gardens, York YO1 7FR",
    postcode: "YO1 7FR",
  },
  /**
   * Calendar entries. Europe/London is BST (UTC+1) on 4 June 2027, so 2:00 pm
   * local = 13:00 UTC. The timed entries below end at midnight (00:00 on the 5th).
   *
   * There is deliberately no calendar entry on the public landing page: it would
   * be shown before anyone has looked up their name, so it couldn't tell an
   * evening-only guest from a ceremony guest. Precise arrival times live in
   * `arrivals` below and are only surfaced after the RSVP lookup, where the
   * ceremony flag is known.
   */
  calendar: {
    title: "Katie & Matty's Wedding",
    description:
      "We're getting married at The Hospitium, York — we can't wait to celebrate with you!",
    timezone: "Europe/London",
  },
  /**
   * EDIT ME — what each kind of guest is invited to, and when to arrive.
   * `ceremony` = invited to the ceremony and the evening; `evening` = evening only.
   * Wording is intentionally warm and framed around what guests ARE invited to.
   */
  arrivals: {
    ceremony: {
      label: "Ceremony & evening",
      arriveFrom: "1:30 pm",
      blurb: "Please arrive from 1:30 pm for a 2:00 pm ceremony.",
      startCompact: "20270604T133000",
      endCompact: "20270605T000000",
      startOffset: "2027-06-04T13:30:00+01:00",
      endOffset: "2027-06-05T00:00:00+01:00",
      icsHref: "/katie-and-matty-ceremony.ics",
    },
    evening: {
      label: "Evening celebrations",
      arriveFrom: "7:00 pm",
      blurb: "Do join us from 7:00 pm for the evening celebrations.",
      startCompact: "20270604T190000",
      endCompact: "20270605T000000",
      startOffset: "2027-06-04T19:00:00+01:00",
      endOffset: "2027-06-05T00:00:00+01:00",
      icsHref: "/katie-and-matty-evening.ics",
    },
  },
} as const;

/** Google Maps embed (no API key needed) + a "Get directions" deep-link. */
export const maps = {
  query: wedding.address.full,
  embedSrc: `https://www.google.com/maps?q=${encodeURIComponent(wedding.address.full)}&output=embed`,
  directionsHref: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(wedding.address.full)}`,
} as const;

/**
 * A Google Maps link for a single place. No API key needed. Make the query
 * specific enough to geocode (include the city); a broader query like
 * "Park and Ride, York" deliberately returns several pins.
 */
export function placeMapHref(query: string): string {
  const params = new URLSearchParams({ api: "1", query });
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

/**
 * One Google Maps link plotting several places at once, as a walking route
 * through them (first = start, last = end, the rest become waypoints).
 *
 * Google Maps has no official URL for "just drop pins on these N places", so a
 * route is the reliable way to get them all onto a single map. No API key needed.
 * Pass at least two places; each should be specific enough to geocode (include
 * the city).
 */
export function multiStopMapHref(places: readonly string[]): string {
  const stops = places.filter(Boolean);
  const origin = stops[0] ?? "";
  const destination = stops.length > 1 ? stops[stops.length - 1] : origin;
  const waypoints = stops.slice(1, -1);

  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "walking",
  });
  if (waypoints.length > 0) params.set("waypoints", waypoints.join("|"));

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export type CalendarTargets = { google: string; outlook: string; ics: string };

/**
 * Timed calendar links for one kind of guest ("ceremony" or "evening"). Only
 * used after the RSVP lookup, where the ceremony flag is known — never before.
 */
export function arrivalCalendarLinks(kind: keyof typeof wedding.arrivals): CalendarTargets {
  const a = wedding.arrivals[kind];
  const c = wedding.calendar;

  const google = new URLSearchParams({
    action: "TEMPLATE",
    text: c.title,
    dates: `${a.startCompact}/${a.endCompact}`,
    ctz: c.timezone,
    details: `${c.description} ${a.blurb}`,
    location: wedding.address.full,
  });

  const outlook = new URLSearchParams({
    rru: "addevent",
    subject: c.title,
    startdt: a.startOffset,
    enddt: a.endOffset,
    location: wedding.address.full,
    body: `${c.description} ${a.blurb}`,
  });

  return {
    google: `https://calendar.google.com/calendar/render?${google.toString()}`,
    outlook: `https://outlook.live.com/calendar/0/action/compose?${outlook.toString()}`,
    ics: a.icsHref,
  };
}
