import { countries } from "../lib/data";

export default function CountryMarquee() {
  const doubled = [...countries, ...countries];

  return (
    <section id="paises" className="relative border-y border-white/5 bg-ink-900/60 py-10">
      <div className="mx-auto mb-6 max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
          Más países que cualquier otra remesadora
        </p>
      </div>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-900 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-900 to-transparent" />

        <div className="flex w-max animate-marquee gap-3 [animation-duration:32s] hover:[animation-play-state:paused]">
          {doubled.map((c, i) => (
            <div
              key={`${c.name}-${i}`}
              className="glass flex shrink-0 items-center gap-2.5 rounded-full px-5 py-2.5"
            >
              <span className="text-xl leading-none">{c.flag}</span>
              <span className="text-sm font-medium text-white/80">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
