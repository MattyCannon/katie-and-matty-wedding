import { wedding } from "@/lib/wedding";
import AddToCalendar from "@/components/AddToCalendar";

export default function Hero() {
  return (
    <section className="relative flex min-h-dvh snap-start flex-col items-center justify-start px-6 pb-16 pt-12 text-center sm:pt-16">
      <p className="label hidden text-[0.7rem] text-botanical-red lg:block">
        Together with their friends &amp; family
      </p>

      <h1 className="mx-auto mt-8 max-w-3xl font-display leading-[1.02] text-ink">
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

      {/* Save the Date sits tight beneath the date line, inside the first screen. */}
      <AddToCalendar className="mt-10 sm:mt-12" />
    </section>
  );
}
