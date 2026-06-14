import { wedding } from "@/lib/wedding";
import { Divider } from "@/components/botanical/Divider";

export default function Footer() {
  return (
    <footer className="relative px-6 pb-14 pt-6 text-center">
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
