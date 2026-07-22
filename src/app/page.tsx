import Link from "next/link";
import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import AddToCalendar from "@/components/AddToCalendar";
import VenueMap from "@/components/VenueMap";
import UsefulInfo from "@/components/UsefulInfo";
import Footer from "@/components/Footer";
import { CornerCluster } from "@/components/botanical/Botanicals";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Botanical clusters framing the four corners. Decorative + non-interactive. */}
      <CornerCluster className="pointer-events-none absolute left-0 top-0 z-0 w-36 opacity-95 sm:w-52 md:w-72" />
      <CornerCluster className="pointer-events-none absolute right-0 top-0 z-0 w-36 -scale-x-100 opacity-95 sm:w-52 md:w-72" />
      <CornerCluster className="pointer-events-none absolute bottom-0 left-0 z-0 w-36 -scale-y-100 opacity-95 sm:w-52 md:w-72" />
      <CornerCluster className="pointer-events-none absolute bottom-0 right-0 z-0 w-36 -scale-x-100 -scale-y-100 opacity-95 sm:w-52 md:w-72" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <NavBar />
        <main className="flex-1">
          <Hero />
          <AddToCalendar />
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
