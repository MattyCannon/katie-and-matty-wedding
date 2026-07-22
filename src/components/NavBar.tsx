import Link from "next/link";
import { navLinks, wedding } from "@/lib/wedding";

export default function NavBar() {
  return (
    <header className="relative z-20 hidden lg:block">
      <nav className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-6 sm:flex-row sm:justify-between sm:gap-6">
        <Link
          href="/"
          aria-label={`${wedding.names.one} and ${wedding.names.two} — home`}
          className="font-display text-2xl font-semibold tracking-[0.15em] text-ink"
        >
          {wedding.names.one.charAt(0)}{" "}
          <span className="italic font-normal text-botanical-red">&amp;</span>{" "}
          {wedding.names.two.charAt(0)}
        </Link>

        <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="label text-[0.7rem] text-ink-soft transition-colors duration-200 hover:text-botanical-red"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
