"use client";

import { useEffect, useRef, useState } from "react";
import { calendarLinks } from "@/lib/wedding";

type Option = {
  label: string;
  href: string;
  external?: boolean;
  download?: boolean;
};

const options: Option[] = [
  { label: "Google Calendar", href: calendarLinks.google, external: true },
  { label: "Outlook", href: calendarLinks.outlook, external: true },
  { label: "Apple Calendar / Other", href: calendarLinks.ics, download: true },
];

/** Single "Add to Calendar" button that opens a small menu of calendar options. */
export default function CalendarDropdown() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        className="btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Add to Calendar
        <svg
          aria-hidden="true"
          viewBox="0 0 12 8"
          className={`h-2.5 w-2.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
        >
          <path d="M1 1.5 6 6.5 11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-1/2 top-full z-30 mt-3 w-64 -translate-x-1/2 overflow-hidden rounded-lg border border-sage/50 bg-ivory text-left shadow-lg"
        >
          {options.map((option) => (
            <a
              key={option.label}
              role="menuitem"
              href={option.href}
              target={option.external ? "_blank" : undefined}
              rel={option.external ? "noopener noreferrer" : undefined}
              download={option.download || undefined}
              onClick={() => setOpen(false)}
              className="block px-5 py-3 font-body text-base text-ink transition-colors duration-150 hover:bg-ivory-deep hover:text-botanical-red"
            >
              {option.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
