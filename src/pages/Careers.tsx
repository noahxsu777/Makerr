import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Briefcase,
  Clock,
  Coffee,
  Laptop,
  MapPin,
  Rocket,
} from "lucide-react";
import PageHero from "../components/PageHero";

const perks = [
  {
    icon: Laptop,
    title: "Remoto de verdad",
    desc: "Todo el equipo trabaja distribuido. Lo que importa es el trabajo, no el horario de oficina.",
  },
  {
    icon: Coffee,
    title: "Equipo pequeño, impacto grande",
    desc: "Sin capas de burocracia — lo que construyes esta semana lo usan miles de familias la próxima.",
  },
  {
    icon: Rocket,
    title: "Crecimiento constante",
    desc: "Estamos agregando países, métodos de pago y funciones nuevas todo el tiempo. Siempre hay algo nuevo que resolver.",
  },
];

const positions = [
  {
    title: "Ingeniero(a) Backend, Pagos",
    department: "Ingeniería",
    location: "Remoto (EE. UU. / LatAm)",
    type: "Tiempo completo",
  },
  {
    title: "Diseñador(a) de Producto",
    department: "Diseño",
    location: "Remoto (EE. UU. / LatAm)",
    type: "Tiempo completo",
  },
  {
    title: "Especialista en Soporte al Cliente (bilingüe)",
    department: "Operaciones",
    location: "Remoto (LatAm)",
    type: "Tiempo completo",
  },
  {
    title: "Analista de Cumplimiento y Riesgo",
    department: "Legal",
    location: "Remoto (EE. UU.)",
    type: "Tiempo completo",
  },
  {
    title: "Growth Marketing Lead",
    department: "Marketing",
    location: "Remoto (EE. UU. / LatAm)",
    type: "Tiempo completo",
  },
];

export default function Careers() {
  return (
    <>
      <PageHero
        eyebrow="Carreras"
        title="Construye la remesadora que tu familia usaría"
        subtitle="Somos un equipo pequeño y remoto, hecho en Estados Unidos, resolviendo un problema que conocemos de primera mano."
      />

      <section className="relative pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-3">
            {perks.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl border border-white/8 bg-white/[0.02] p-6"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-lime-400/15 text-lime-300">
                  <p.icon size={20} />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold text-white">
                  {p.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/50">
                  {p.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative pb-24 sm:pb-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center gap-2">
            <Briefcase size={18} className="text-lime-300" />
            <h2 className="font-display text-2xl font-bold text-white">
              Posiciones abiertas
            </h2>
          </div>

          <div className="space-y-4">
            {positions.map((pos, i) => (
              <motion.div
                key={pos.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-lime-300/80">
                    {pos.department}
                  </span>
                  <h3 className="mt-1 font-display text-base font-semibold text-white">
                    {pos.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/40">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={12} />
                      {pos.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} />
                      {pos.type}
                    </span>
                  </div>
                </div>
                <a
                  href={`mailto:carreras@lukea.com?subject=${encodeURIComponent(
                    `Aplicación: ${pos.title}`
                  )}`}
                  className="group flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/85 transition-colors hover:bg-white/5"
                >
                  Aplicar
                  <ArrowUpRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </motion.div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-white/40">
            ¿No ves una posición que encaje pero crees que puedes aportar?
            Escríbenos a{" "}
            <a
              href="mailto:carreras@lukea.com"
              className="font-semibold text-lime-300 hover:text-lime-200"
            >
              carreras@lukea.com
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
