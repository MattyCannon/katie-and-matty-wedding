import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import OrderOfService from "@/components/OrderOfService";
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
          <OrderOfService />
          <AddToCalendar />
          <VenueMap />
          <UsefulInfo />
        </main>
        <Footer />
      </div>
    </div>
  );
}
