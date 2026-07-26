/**
 * EDIT ME — content for the "Useful Information" accordion.
 *
 * Each accordion panel is one entry in this array. Inside a panel, items can
 * be grouped under an optional `heading`. Give an item an `href` to make its
 * name a clickable link; omit `href` for plain text. `detail` is the small
 * grey note shown after the name.
 *
 * A panel can also carry a `mapLink` — one Google Maps link plotting several
 * places on a single map (see "Local Recommendations" below, where the places
 * are listed once in `RECOMMENDATION_PLACES` and both the on-page list and the
 * map link are built from them, so they can't drift apart).
 *
 * Links point at Google Maps rather than at venue websites — `placeMapHref()`
 * for a single place, `multiStopMapHref()` for several on one map. Both are in
 * `src/lib/wedding.ts` and need no API key.
 *
 * Content below is a sensible starting point for York — swap it for whatever
 * you'd like to recommend. Nothing else in the app needs changing.
 */
import { multiStopMapHref, placeMapHref } from "@/lib/wedding";

export type InfoItem = {
  name: string;
  detail?: string;
  href?: string;
};

export type InfoGroup = {
  heading?: string;
  items: InfoItem[];
};

export type InfoPanel = {
  id: string;
  title: string;
  intro?: string;
  groups: InfoGroup[];
  /** Optional single "see them all on a map" link, shown below the panel's items. */
  mapLink?: { label: string; href: string };
};

/**
 * EDIT ME — the recommendations, in the order they should appear on the map
 * route. `mapQuery` is what gets sent to Google Maps (keep ", York" so it
 * geocodes to the right place); `name`/`detail` are what guests read.
 */
const RECOMMENDATION_PLACES = [
  {
    name: "York Minster",
    detail: "The breathtaking cathedral at the heart of the city",
    mapQuery: "York Minster, York",
  },
  {
    name: "The Shambles",
    detail: "York's famous medieval street",
    mapQuery: "The Shambles, York",
  },
  {
    name: "Bettys Café Tea Rooms",
    detail: "A York institution for afternoon tea",
    mapQuery: "Bettys Café Tea Rooms, St Helen's Square, York",
  },
  {
    name: "York City Walls",
    detail: "A scenic walk around the historic walls",
    mapQuery: "York City Walls, York",
  },
] as const;

export const usefulInfo: InfoPanel[] = [
  {
    id: "travel",
    title: "Travel",
    intro:
      "The Hospitium sits inside the Museum Gardens in the centre of York — easiest reached on foot, by train, or by taxi.",
    groups: [
      {
        heading: "Nearest stations",
        items: [
          {
            name: "York Railway Station",
            detail: "~10–15 min walk to the Museum Gardens; direct trains from London, Edinburgh, Manchester & Leeds",
            href: placeMapHref("York Railway Station, York"),
          },
        ],
      },
      {
        heading: "Parking",
        items: [
          {
            name: "Marygate Car Park",
            detail: "Closest to the Museum Gardens (a few minutes' walk)",
            href: placeMapHref("Marygate Car Park, Marygate, York"),
          },
          {
            name: "Bootham Row Car Park",
            detail: "Short walk via Bootham / St Leonard's Place",
            href: placeMapHref("Bootham Row Car Park, York"),
          },
          {
            name: "Park & Ride",
            detail: "Several routes into the city centre — handy on busy weekends",
            // Broad query on purpose: shows all of York's Park & Ride sites at once.
            href: placeMapHref("Park and Ride, York"),
          },
        ],
      },
    ],
  },
  {
    id: "stay",
    title: "Where to Stay",
    intro: "A few places within easy reach of the venue — book early for a summer weekend.",
    groups: [
      {
        heading: "Hotels",
        items: [
          {
            name: "The Milner York",
            detail: "Where Katie & Matty are staying — by the station",
            href: "https://www.themilneryork.com/",
          },
          {
            name: "The Grand, York",
            detail: "5-star, near the station (~10 min walk)",
            href: "https://www.thegrandyork.co.uk/",
          },
        ],
      },
    ],
  },
  {
    id: "recommendations",
    title: "Local Recommendations",
    intro: "If you're making a weekend of it, a few of our favourite things to do in York.",
    groups: [
      {
        // Plain text — no individual links. The single map link below covers them all.
        items: RECOMMENDATION_PLACES.map(({ name, detail }) => ({ name, detail })),
      },
    ],
    mapLink: {
      label: "See them all on Google Maps",
      href: multiStopMapHref(RECOMMENDATION_PLACES.map((p) => p.mapQuery)),
    },
  },
];
