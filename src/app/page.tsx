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

        <main className="flex-1">
          {/* The RSVP button lives inside the hero, beneath the date and venue. */}
          <Hero />
          <VenueMap />
          <UsefulInfo />
        </main>

        {/* No divider here: the landing page ends on the Gifts note, which has its own. */}
        <Footer divider={false} />
      </div>
    </div>
  );
}
