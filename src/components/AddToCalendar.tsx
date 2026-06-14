import { calendarLinks, wedding } from "@/lib/wedding";

export default function AddToCalendar() {
  return (
    <section className="relative px-6 pb-14 pt-4 text-center">
      <div className="mx-auto max-w-prose">
        <p className="label text-[0.72rem] text-botanical-red">Save the Date</p>
        <p className="mx-auto mt-4 max-w-md font-body text-lg italic text-ink-soft">
          Pop {wedding.date.full} in your diary — add it to your calendar in a tap.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a
            className="btn"
            href={calendarLinks.google}
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Calendar
          </a>
          <a
            className="btn"
            href={calendarLinks.outlook}
            target="_blank"
            rel="noopener noreferrer"
          >
            Outlook
          </a>
          <a className="btn" href={calendarLinks.ics} download>
            Download .ics
          </a>
        </div>

        <p className="mt-4 font-body text-sm text-ink-soft">
          Apple Calendar &amp; others: use “Download .ics”.
        </p>
      </div>
    </section>
  );
}
