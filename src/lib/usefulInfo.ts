/**
 * EDIT ME — content for the "Useful Information" accordion.
 *
 * Each accordion panel is one entry in this array. Inside a panel, items can
 * be grouped under an optional `heading`. Give an item an `href` to make its
 * name a clickable link; omit `href` for plain text. `detail` is the small
 * grey note shown after the name.
 *
 * Links below are sensible starting points for York — swap them for whatever
 * you'd like to recommend. Nothing else in the app needs changing.
 */

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
};

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
            href: "https://www.nationalrail.co.uk/stations/york/",
          },
        ],
      },
      {
        heading: "Parking",
        items: [
          {
            name: "Marygate Car Park",
            detail: "Closest to the Museum Gardens (a few minutes' walk)",
            href: "https://www.york.gov.uk/parking",
          },
          {
            name: "Bootham Row Car Park",
            detail: "Short walk via Bootham / St Leonard's Place",
            href: "https://www.york.gov.uk/parking",
          },
          {
            name: "Park & Ride",
            detail: "Several routes into the city centre — handy on busy weekends",
            href: "https://www.itravelyork.info/park-and-ride",
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
            name: "The Grand, York",
            detail: "5-star, near the station (~10 min walk)",
            href: "https://www.thegrandyork.co.uk/",
          },
          {
            name: "Dean Court Hotel",
            detail: "Beside York Minster, very central",
            href: "https://www.deancourt-york.co.uk/",
          },
          {
            name: "Hotel du Vin York",
            detail: "Boutique, on The Mount",
            href: "https://www.hotelduvin.com/locations/york/",
          },
        ],
      },
      {
        heading: "B&Bs & guesthouses",
        items: [
          {
            name: "Bootham guesthouses",
            detail: "Several B&Bs along Bootham, a short walk from the gardens",
            href: "https://www.visityork.org/accommodation",
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
        items: [
          {
            name: "York Minster",
            detail: "The breathtaking cathedral at the heart of the city",
            href: "https://yorkminster.org/",
          },
          {
            name: "The Shambles",
            detail: "York's famous medieval street",
            href: "https://www.visityork.org/things-to-do/the-shambles",
          },
          {
            name: "Bettys Café Tea Rooms",
            detail: "A York institution for afternoon tea",
            href: "https://www.bettys.co.uk/cafe-tea-rooms/our-locations/bettys-york",
          },
          {
            name: "York City Walls",
            detail: "A scenic walk around the historic walls",
            href: "https://www.visityork.org/things-to-do/york-city-walls",
          },
        ],
      },
    ],
  },
];
