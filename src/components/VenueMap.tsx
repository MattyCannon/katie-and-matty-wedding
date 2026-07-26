import { maps, wedding } from "@/lib/wedding";
import { Divider } from "@/components/botanical/Divider";

export default function VenueMap() {
  return (
    <section
      id="venue"
      className="section-anchor relative flex min-h-dvh snap-start flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="mx-auto max-w-2xl">
        <p className="label text-[0.72rem] text-botanical-red">The Venue</p>
        <h2 className="mt-4 font-display text-4xl text-ink sm:text-5xl">{wedding.venue}</h2>
        <p className="mt-3 font-body text-lg text-ink-soft">{wedding.address.full}</p>

        <Divider className="mx-auto mt-5 h-7 w-48" />

        <div className="mt-7 overflow-hidden rounded-lg border border-sage/50 shadow-sm">
          <iframe
            title={`Map showing ${wedding.venue}, ${wedding.location.city}`}
            src={maps.embedSrc}
            width="100%"
            height="380"
            style={{ border: 0, display: "block" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        <div className="mt-6">
          <a className="btn" href={maps.directionsHref} target="_blank" rel="noopener noreferrer">
            Get directions
          </a>
        </div>
      </div>
    </section>
  );
}
