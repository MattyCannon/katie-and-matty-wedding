import Link from "next/link";
import { wedding } from "@/lib/wedding";

export default function Hero() {
  return (
    // The wildflower border is drawn once for the whole page (see
    // `WildflowerBorder`), not per section. Everything here — the names, the
    // date/venue and the RSVP button beneath them — is one block, centred in the
    // first screen, horizontally and vertically.
    <section className="relative flex min-h-dvh snap-start flex-col items-center justify-center px-6 py-16 text-center">
      <p className="label hidden text-[0.7rem] text-botanical-red lg:block">
        Together with their friends &amp; family
      </p>

      {/* The gap above the names only applies when the eyebrow above them is showing (`lg`+). */}
      <h1 className="mx-auto max-w-3xl font-display leading-[1.02] text-ink lg:mt-8">
        <span className="block text-5xl font-medium uppercase tracking-[0.1em] sm:text-6xl md:text-7xl">
          {wedding.names.one}
        </span>
        <span
          aria-hidden="true"
          className="my-2 block font-display text-3xl font-light italic text-botanical-red sm:text-4xl"
        >
          &amp;
        </span>
        <span className="block text-5xl font-medium uppercase tracking-[0.1em] sm:text-6xl md:text-7xl">
          {wedding.names.two}
        </span>
      </h1>

      <p className="mx-auto mt-8 max-w-md font-body text-lg italic text-ink-soft sm:text-xl">
        are getting married
      </p>

      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
        <span className="label text-[0.78rem] text-ink">
          <time dateTime={wedding.isoDate}>{wedding.date.full}</time>
        </span>
        <span aria-hidden="true" className="hidden text-sage sm:inline">
          ❖
        </span>
        <span className="label text-[0.78rem] text-ink">
          {wedding.venue}, {wedding.location.city}
        </span>
      </div>

      {/* The RSVP button, tight beneath the date line. */}
      <Link
        href="/rsvp"
        className="mt-10 inline-flex items-center justify-center rounded-full border border-botanical-red bg-botanical-red px-10 py-3 font-display text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-ivory transition-colors duration-200 hover:bg-botanical-red-deep sm:mt-12"
      >
        RSVP
      </Link>
    </section>
  );
}
