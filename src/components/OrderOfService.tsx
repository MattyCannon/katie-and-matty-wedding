import { wedding } from "@/lib/wedding";
import { Divider } from "@/components/botanical/Divider";

const rows = [
  { label: "The Date", value: wedding.date.full },
  { label: "The Time", value: wedding.time.words },
  { label: "The Venue", value: wedding.venue },
  { label: "The Setting", value: wedding.location.full },
] as const;

export default function OrderOfService() {
  return (
    <section className="relative px-6 pb-16 pt-12 sm:pt-16">
      <div className="mx-auto max-w-prose text-center">
        <p className="label text-[0.72rem] text-botanical-red">Order of Service</p>

        <Divider className="mx-auto mt-5 h-7 w-48 text-forest" />

        <dl className="mx-auto mt-8 max-w-md">
          {rows.map((row, i) => (
            <div key={row.label} className="py-5">
              {i > 0 && <hr className="hairline mb-5" aria-hidden="true" />}
              <dt className="label text-[0.68rem] text-ink-soft">{row.label}</dt>
              <dd className="mt-2 font-display text-2xl text-ink sm:text-3xl">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
