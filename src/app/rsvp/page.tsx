import type { Metadata } from "next";
import Footer from "@/components/Footer";
import RsvpForm from "@/components/RsvpForm";
import { WildflowerBorder } from "@/components/botanical/WildflowerBorder";
import { Divider } from "@/components/botanical/Divider";
import { wedding } from "@/lib/wedding";

export const metadata: Metadata = {
  title: `RSVP · ${wedding.names.one} & ${wedding.names.two}`,
  description: `Let ${wedding.names.one} & ${wedding.names.two} know if you can join them at ${wedding.venue}, ${wedding.location.city}, on ${wedding.date.full}.`,
};

export default function RsvpPage() {
  return (
    // `min-h-dvh` (not `min-h-screen`): on phones `100vh` includes the browser
    // toolbar, which would push the centred block off-centre.
    <div className="relative isolate min-h-dvh overflow-hidden">
      <WildflowerBorder />

      <div className="flex min-h-dvh flex-col">
        {/* The whole block is centred in the space above the footer. */}
        {/* Extra top room on phones keeps the heading clear of the corner stems. */}
        <main className="flex flex-1 items-center justify-center px-8 pb-10 pt-28 sm:py-10">
          <div className="w-full max-w-xl">
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
