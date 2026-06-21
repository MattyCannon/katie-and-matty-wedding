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
  /** RSVP deadline shown on the RSVP page. EDIT as needed. */
  rsvpBy: "Saturday 1st May 2027",
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
   * Calendar event details. Europe/London is BST (UTC+1) on 4 June 2027,
   * so 2:00 pm local = 13:00 UTC. End time is an estimate — EDIT if needed.
   */
  calendar: {
    title: "Katie & Matty's Wedding",
    description:
      "We're getting married at The Hospitium, York — we can't wait to celebrate with you!",
    timezone: "Europe/London",
    /** Local times (no offset) for the human-facing services. */
    startLocal: "2027-06-04T14:00:00",
    endLocal: "2027-06-04T23:00:00",
    /** Local times with offset, for unambiguous Outlook deep-links. */
    startOffset: "2027-06-04T14:00:00+01:00",
    endOffset: "2027-06-04T23:00:00+01:00",
    /** Compact local form for Google Calendar (used with the ctz param). */
    startCompact: "20270604T140000",
    endCompact: "20270604T230000",
    /** Path to the downloadable .ics in /public. */
    icsHref: "/katie-and-matty-wedding.ics",
  },
} as const;

/**
 * Navigation. On-page sections use hash links; sections we'll build later
 * (RSVP, FAQ) point at routes that don't exist yet (they 404 until built).
 */
export const navLinks = [
  { label: "RSVP", href: "/rsvp" },
  { label: "Details", href: "#venue" },
  { label: "Travel & Stay", href: "#useful-info" },
] as const;

/** Google Maps embed (no API key needed) + a "Get directions" deep-link. */
export const maps = {
  query: wedding.address.full,
  embedSrc: `https://www.google.com/maps?q=${encodeURIComponent(wedding.address.full)}&output=embed`,
  directionsHref: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(wedding.address.full)}`,
} as const;

/** Builds the Add-to-Calendar deep-links from the details above. */
export const calendarLinks = {
  google: (() => {
    const c = wedding.calendar;
    const p = new URLSearchParams({
      action: "TEMPLATE",
      text: c.title,
      dates: `${c.startCompact}/${c.endCompact}`,
      ctz: c.timezone,
      details: c.description,
      location: wedding.address.full,
    });
    return `https://calendar.google.com/calendar/render?${p.toString()}`;
  })(),
  outlook: (() => {
    const c = wedding.calendar;
    const p = new URLSearchParams({
      rru: "addevent",
      subject: c.title,
      startdt: c.startOffset,
      enddt: c.endOffset,
      location: wedding.address.full,
      body: c.description,
    });
    return `https://outlook.live.com/calendar/0/action/compose?${p.toString()}`;
  })(),
  ics: wedding.calendar.icsHref,
} as const;
