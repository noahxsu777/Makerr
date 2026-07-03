import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Globe2,
  Handshake,
  Heart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import PageHero from "../components/PageHero";
import Counter from "../components/Counter";
import { stats } from "../lib/data";

const values = [
  {
    icon: Handshake,
    title: "Transparencia primero",
    desc: "Si te cobramos algo, lo ves antes de confirmar. Sin comisiones escondidas en la tasa de cambio.",
  },
  {
    icon: Sparkles,
    title: "Más opciones, no menos",
    desc: "Ocho formas de entrega, dos formas de pago y códigos promocionales — la flexibilidad no debería ser un lujo.",
  },
  {
    icon: ShieldCheck,
    title: "Seguridad sin fricción",
    desc: "Cifrado de nivel bancario y procesamiento de pagos certificado, sin hacerte llenar el mismo formulario tres veces.",
  },
  {
    icon: Heart,
    title: "Hecho para la comunidad",
    desc: "Diseñado en EE. UU. por y para la diáspora latina, pensando en cómo se mueve el dinero entre familias de verdad.",
  },
];

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="Sobre nosotros"
        title="Una remesadora construida por gente que también manda dinero a casa"
        subtitle="Lukea nació de una frustración simple: enviar dinero a la familia no debería sentirse como un trámite bancario de los años 90."
      />

      <section className="relative pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="glass space-y-5 rounded-[1.75rem] p-6 sm:p-10"
          >
            <h2 className="font-display text-2xl font-bold text-white">
              Nuestra historia
            </h2>
            <p className="text-[15px] leading-relaxed text-white/65">
              Como muchas familias latinas en Estados Unidos, la nuestra manda
              dinero a casa todos los meses. Y como muchas familias, nos
              cansamos de comparar seis apps distintas cada vez, de tasas de
              cambio que cambiaban sin avisar, y de tener que elegir entre
              "rápido" o "barato" — nunca ambos.
            </p>
            <p className="text-[15px] leading-relaxed text-white/65">
              Construimos Lukea para resolver eso: una calculadora que muestra
              la tasa real en vivo antes de que confirmes nada, una comisión
              fija que no cambia según a dónde envíes, y ocho formas distintas
              de que tu gente reciba el dinero como prefiera — desde una
              billetera móvil hasta efectivo en la esquina de su casa.
            </p>
            <p className="text-[15px] leading-relaxed text-white/65">
              Seguimos siendo un equipo pequeño, hecho en Estados Unidos,
              construyendo para la comunidad latina que conocemos de primera
              mano. Cada país, cada forma de entrega y cada tasa que agregamos
              viene de una pregunta real que alguien nos hizo.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="font-display text-2xl font-bold text-white sm:text-3xl">
                  <Counter value={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-1 text-xs text-white/45">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative pb-24 sm:pb-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Lo que nos guía
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              Cuatro cosas que no negociamos
            </h2>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
                className="flex gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-6"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-lime-400/20 to-emerald-400/10 text-lime-300 ring-1 ring-white/10">
                  <v.icon size={20} />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-white">
                    {v.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/50">
                    {v.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="glass mt-14 flex flex-col items-center gap-5 rounded-[1.75rem] p-8 text-center sm:p-12"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-lime-400/15 text-lime-300">
              <Globe2 size={22} />
            </span>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              ¿Quieres ver cómo funciona?
            </h2>
            <p className="max-w-md text-white/55">
              Calcula un envío en segundos, sin crear cuenta. La tasa que ves
              es la tasa que pagas.
            </p>
            <Link
              to="/#calculadora"
              className="group flex items-center gap-2 rounded-full bg-lime-400 px-7 py-3.5 text-sm font-semibold text-ink-950 transition-all hover:bg-lime-300 hover:shadow-[0_0_24px_rgba(200,255,77,0.5)]"
            >
              Calcula tu envío
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
