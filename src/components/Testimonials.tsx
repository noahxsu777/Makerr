import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { testimonials } from "../lib/data";

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % testimonials.length);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  const go = (dir: number) => {
    setDirection(dir);
    setIndex((i) => (i + dir + testimonials.length) % testimonials.length);
  };

  const t = testimonials[index];

  return (
    <section id="testimonios" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-400">
            Historias reales
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            Familias que ya cambiaron de app
          </h2>
        </motion.div>

        <div className="relative">
          <div className="glass relative min-h-[280px] overflow-hidden rounded-[2rem] p-8 sm:p-12">
            <Quote
              className="absolute right-8 top-8 text-white/5"
              size={72}
              strokeWidth={1.5}
            />
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative"
              >
                <p className="font-display text-xl leading-relaxed text-white sm:text-2xl">
                  “{t.quote}”
                </p>
                <div className="mt-8 flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-2xl">
                    {t.avatar}
                  </span>
                  <div>
                    <div className="font-semibold text-white">{t.name}</div>
                    <div className="text-sm text-white/45">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => go(-1)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-white/30 hover:text-white"
              aria-label="Anterior"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  className="relative h-1.5 rounded-full bg-white/15 transition-all"
                  style={{ width: i === index ? 24 : 6 }}
                  aria-label={`Testimonio ${i + 1}`}
                >
                  {i === index && (
                    <motion.span
                      layoutId="active-dot"
                      className="absolute inset-0 rounded-full bg-lime-400"
                    />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => go(1)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-white/30 hover:text-white"
              aria-label="Siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
