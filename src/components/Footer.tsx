import { wedding } from "@/lib/wedding";
import { Divider } from "@/components/botanical/Divider";

export default function Footer({ divider = true }: { divider?: boolean }) {
  return (
    // Generous bottom padding: the border's bottom cluster grows up from the page
    // edge, and this keeps its middle stems beneath the footer text, not through it.
    // Wider side margins on phones: centred footer lines run nearly edge to edge,
    // and the side stems reach in from both edges.
    <footer className="relative px-8 pb-32 pt-6 text-center sm:px-6 sm:pb-28">
      {divider && <Divider className="mx-auto h-8 w-52 text-forest" />}

      <p
        className={`${divider ? "mt-6 " : ""}font-display text-xl italic text-ink-soft sm:text-2xl`}
      >
        We can&apos;t wait to celebrate with you.
      </p>

      {/*
        Three parts, each kept whole (`whitespace-nowrap`), so a line break can only
        fall BETWEEN them — never through the date. On phones they stack, one per
        line; from `md` they sit in a single row with dot separators.
      */}
      <p className="label mt-5 flex flex-col items-center gap-1.5 text-[0.62rem] text-ink-soft md:flex-row md:justify-center md:gap-0">
        <span className="whitespace-nowrap">
          {wedding.names.one} &amp; {wedding.names.two}
        </span>
        <span className="mx-2 hidden text-sage md:inline" aria-hidden="true">
          ·
        </span>
        <span className="whitespace-nowrap">
          <time dateTime={wedding.isoDate}>{wedding.date.full}</time>
        </span>
        <span className="mx-2 hidden text-sage md:inline" aria-hidden="true">
          ·
        </span>
        <span className="whitespace-nowrap">{wedding.location.full}</span>
      </p>
    </footer>
  );
}
