import Link from "next/link";
import Hero from "@/components/Hero";
import VenueMap from "@/components/VenueMap";
import UsefulInfo from "@/components/UsefulInfo";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    // The scattered wildflowers live inside each section (see
    // `WildflowerScatter`), so they can key off that section's height. Clipping
    // here keeps motifs that hang off the left and right edges from ever
    // widening the page.
    <div className="relative min-h-screen overflow-hidden">
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
