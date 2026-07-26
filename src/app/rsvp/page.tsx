import type { Metadata } from "next";
import Footer from "@/components/Footer";
import RsvpForm from "@/components/RsvpForm";
import { WildflowerCorner } from "@/components/botanical/WildflowerCorner";
import { Divider } from "@/components/botanical/Divider";
import { wedding } from "@/lib/wedding";

export const metadata: Metadata = {
  title: `RSVP · ${wedding.names.one} & ${wedding.names.two}`,
  description: `Let ${wedding.names.one} & ${wedding.names.two} know if you can join them at ${wedding.venue}, ${wedding.location.city}, on ${wedding.date.full}.`,
};

export default function RsvpPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <WildflowerCorner
        stem="flax"
        className="pointer-events-none absolute left-0 top-0 z-0 w-16 opacity-90 sm:w-24 md:w-32"
      />
      <WildflowerCorner
        stem="sprig"
        className="pointer-events-none absolute right-0 top-0 z-0 w-16 -scale-x-100 opacity-90 sm:w-24 md:w-32"
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-xl">
            <div className="text-center">
              <p className="label text-[0.72rem] text-botanical-red">Répondez s&apos;il vous plaît</p>
              <h1 className="mt-4 font-display text-5xl text-ink sm:text-6xl">RSVP</h1>
              <p className="mx-auto mt-4 max-w-sm font-body text-lg text-ink-soft">
                Find your name to let us know who can join us on {wedding.date.full}.
              </p>
              <Divider className="mx-auto mt-6 h-7 w-44" />
            </div>

            <div className="mt-8">
              <RsvpForm />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
