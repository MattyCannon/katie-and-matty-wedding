import Link from "next/link";
import Hero from "@/components/Hero";
import VenueMap from "@/components/VenueMap";
import UsefulInfo from "@/components/UsefulInfo";
import Footer from "@/components/Footer";
import { WildflowerBorder } from "@/components/botanical/WildflowerBorder";

export default function Home() {
  return (
    // Clipping here keeps flowers that hang off the left and right edges from
    // ever widening the page.
    <div className="relative min-h-screen overflow-hidden">
      {/* `relative z-10` is the stacking context the border's `-z-10` layer needs. */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* One border around the whole page: top, both sides, bottom. */}
        <WildflowerBorder />

        {/*
          The RSVP button lives in a slim header at the very top, centred. It's
          absolutely positioned so the hero keeps its full-viewport height; the
          hero's top padding leaves room for it. The border's top cluster keeps
          clear of the centre (its top-edge stems hang from the outer fifths).
        */}
        <header className="absolute inset-x-0 top-0 z-20 flex justify-center px-6 pt-6 sm:pt-8">
          <nav aria-label="Primary">
            <Link
              href="/rsvp"
              className="inline-flex items-center justify-center rounded-full border border-botanical-red bg-botanical-red px-9 py-2.5 font-display text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-ivory transition-colors duration-200 hover:bg-botanical-red-deep sm:px-10 sm:py-3"
            >
              RSVP
            </Link>
          </nav>
        </header>

        <main className="flex-1">
          <Hero />
          <VenueMap />
          <UsefulInfo />
        </main>

        {/* No divider here: the RSVP button it used to sit beneath has moved to the header. */}
        <Footer divider={false} />
      </div>
    </div>
  );
}
