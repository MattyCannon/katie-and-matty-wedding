import { wedding } from "@/lib/wedding";
import { Divider } from "@/components/botanical/Divider";

export default function Footer() {
  return (
    // Generous bottom padding: the border's bottom cluster grows up from the page
    // edge, and this keeps its middle stems beneath the footer text, not through it.
    // Wider side margins on phones: centred footer lines run nearly edge to edge,
    // and the side stems reach in from both edges.
    <footer className="relative px-8 pb-32 pt-6 text-center sm:px-6 sm:pb-28">
      <Divider className="mx-auto h-8 w-52 text-forest" />

      <p className="mt-6 font-display text-xl italic text-ink-soft sm:text-2xl">
        We can&apos;t wait to celebrate with you.
      </p>

      <p className="label mt-5 text-[0.62rem] text-ink-soft">
        {wedding.names.one} &amp; {wedding.names.two}
        <span className="mx-2 text-sage" aria-hidden="true">
          ·
        </span>
        {wedding.date.full}
        <span className="mx-2 text-sage" aria-hidden="true">
          ·
        </span>
        {wedding.location.full}
      </p>
    </footer>
  );
}
