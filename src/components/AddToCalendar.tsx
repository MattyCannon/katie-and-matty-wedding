import CalendarDropdown from "@/components/CalendarDropdown";

/**
 * "Save the Date" heading + Add to Calendar button.
 *
 * Rendered INSIDE the Hero, directly beneath the date/venue line, so it sits
 * tight under the top section rather than in a section of its own. It carries no
 * vertical padding — spacing is passed in by the caller via `className`.
 */
export default function AddToCalendar({ className = "" }: { className?: string }) {
  return (
    <div className={`text-center ${className}`}>
      <h2 className="font-display text-2xl uppercase tracking-[0.14em] text-botanical-red sm:text-3xl">
        Save the Date
      </h2>

      <div className="mt-4">
        <CalendarDropdown />
      </div>
    </div>
  );
}
