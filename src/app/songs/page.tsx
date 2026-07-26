import type { Metadata } from "next";
import Footer from "@/components/Footer";
import SongRequest from "@/components/SongRequest";
import { WildflowerCorner } from "@/components/botanical/WildflowerCorner";
import { Divider } from "@/components/botanical/Divider";
import { wedding } from "@/lib/wedding";

export const metadata: Metadata = {
  title: `Request a Song · ${wedding.names.one} & ${wedding.names.two}`,
  description: `Add a song to ${wedding.names.one} & ${wedding.names.two}'s wedding playlist.`,
};

export default function SongsPage() {
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
              <p className="label text-[0.72rem] text-botanical-red">Get us dancing</p>
              <h1 className="mt-4 font-display text-5xl text-ink sm:text-6xl">Request a Song</h1>
              <p className="mx-auto mt-4 max-w-sm font-body text-lg text-ink-soft">
                Add a track to our wedding playlist — whatever will get you on the
                dance floor.
              </p>
              <Divider className="mx-auto mt-6 h-7 w-44" />
            </div>

            <div className="mt-8">
              <SongRequest />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
