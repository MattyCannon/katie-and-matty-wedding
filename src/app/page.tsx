import Link from "next/link";
import Hero from "@/components/Hero";
import VenueMap from "@/components/VenueMap";
import UsefulInfo from "@/components/UsefulInfo";
import Footer from "@/components/Footer";
import { WildflowerCorner } from "@/components/botanical/WildflowerCorner";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Watercolour wildflowers framing the four corners. Decorative + non-interactive. */}
      <WildflowerCorner
        stem="flax"
        className="pointer-events-none absolute left-0 top-0 z-0 w-20 opacity-90 sm:w-28 md:w-36"
      />
      <WildflowerCorner
        stem="sprig"
        className="pointer-events-none absolute right-0 top-0 z-0 w-20 -scale-x-100 opacity-90 sm:w-28 md:w-36"
      />
      {/* Bottom pair: upright (no vertical flip), so the stems grow up from the
          bottom edge rather than hanging down from it. */}
      <WildflowerCorner
        stem="sprig"
        className="pointer-events-none absolute bottom-0 left-0 z-0 w-20 opacity-90 sm:w-28 md:w-36"
      />
      <WildflowerCorner
        stem="flax"
        className="pointer-events-none absolute bottom-0 right-0 z-0 w-20 -scale-x-100 opacity-90 sm:w-28 md:w-36"
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="flex-1">
          <Hero />
          <VenueMap />
          <UsefulInfo />

          <section className="relative px-6 pb-8 pt-4 text-center">
            <div>
              <Link
                href="/rsvp"
                className="inline-flex items-center justify-center rounded-full border border-botanical-red bg-botanical-red px-10 py-3.5 font-display uppercase tracking-[0.18em] text-[0.82rem] font-semibold text-ivory transition-colors duration-200 hover:bg-botanical-red-deep"
              >
                RSVP
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}
