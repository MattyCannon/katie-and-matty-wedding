import { usefulInfo, type InfoItem } from "@/lib/usefulInfo";
import { Divider } from "@/components/botanical/Divider";

function ItemName({ item }: { item: InfoItem }) {
  if (item.href) {
    return (
      <a className="info-link" href={item.href} target="_blank" rel="noopener noreferrer">
        {item.name}
      </a>
    );
  }
  return <span className="text-ink">{item.name}</span>;
}

export default function UsefulInfo() {
  return (
    <section id="useful-info" className="section-anchor relative px-6 pb-16 pt-8">
      <div className="mx-auto max-w-prose text-center">
        <p className="label text-[0.72rem] text-botanical-red">Useful Information</p>
        <Divider className="mx-auto mt-5 h-7 w-48" />
      </div>

      <div className="mx-auto mt-6 max-w-prose text-left">
        {usefulInfo.map((panel, idx) => (
          <details key={panel.id} className="acc" open={idx === 0}>
            <summary>
              {panel.title}
              <svg
                className="acc-chevron"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>

            <div className="pb-6">
              {panel.intro && (
                <p className="mb-4 font-body text-ink-soft">{panel.intro}</p>
              )}

              {panel.groups.map((group, gi) => (
                <div key={gi} className="mb-4 last:mb-0">
                  {group.heading && (
                    <p className="label mb-3 text-[0.62rem] text-sage">{group.heading}</p>
                  )}
                  <ul className="space-y-2.5">
                    {group.items.map((item, ii) => (
                      <li key={ii} className="font-body text-lg leading-snug">
                        <ItemName item={item} />
                        {item.detail && (
                          <span className="block text-sm text-ink-soft sm:ml-1 sm:inline">
                            <span aria-hidden="true" className="mx-1.5 hidden text-sage sm:inline">
                              ·
                            </span>
                            {item.detail}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {panel.mapLink && (
                <div className="mt-5">
                  <a
                    className="btn"
                    href={panel.mapLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {panel.mapLink.label}
                  </a>
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
