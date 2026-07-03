import { motion } from "framer-motion";
import { Mail, Megaphone, Newspaper, Palette } from "lucide-react";
import PageHero from "../components/PageHero";

const announcements = [
  {
    date: "Julio 2026",
    title: "Lukea reduce su margen cambiario a 2.5%",
    desc: "Como parte de nuestro compromiso de transparencia, bajamos el margen que aplicamos sobre la tasa de cambio en tiempo real — la diferencia más baja que hemos ofrecido desde el lanzamiento.",
  },
  {
    date: "Julio 2026",
    title: "Ahora se puede pagar en cripto con MaxelPay",
    desc: "Lukea suma una segunda forma de pago junto a Stripe: checkout en cripto hospedado por MaxelPay, con confirmación automática.",
  },
  {
    date: "Junio 2026",
    title: "Lanzamiento de códigos promocionales",
    desc: "Los usuarios ya pueden aplicar códigos de descuento sobre el costo de envío directamente desde la calculadora, sin necesidad de crear cuenta.",
  },
  {
    date: "Mayo 2026",
    title: "Cobertura ampliada a 22 países",
    desc: "Lukea suma formas de entrega específicas por país — como el CCI en Perú y los requisitos de cuenta bancaria en Colombia — para su red de envíos en Latinoamérica y Asia.",
  },
];

export default function Press() {
  return (
    <>
      <PageHero
        eyebrow="Prensa"
        title="Sala de prensa"
        subtitle="Recursos, boilerplate y contacto directo para periodistas y creadores de contenido."
      />

      <section className="relative pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="glass rounded-2xl p-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-lime-400/15 text-lime-300">
                <Newspaper size={20} />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-white">
                Acerca de Lukea
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Lukea es una plataforma de envío de dinero hecha en Estados
                Unidos para la comunidad latina. Ofrece tasas de cambio en
                tiempo real con margen transparente, ocho formas de entrega
                en 21 países, y pago con tarjeta, cuenta bancaria o cripto.
                Boilerplate libre de usar en artículos y menciones.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.06 }}
              className="glass rounded-2xl p-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-400/15 text-emerald-400">
                <Mail size={20} />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-white">
                Contacto de prensa
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Para entrevistas, datos o solicitudes de comentario,
                escríbenos directamente. Respondemos en un plazo de 1 a 2
                días hábiles.
              </p>
              <a
                href="mailto:prensa@lukea.com"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-lime-300 hover:text-lime-200"
              >
                prensa@lukea.com
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="glass rounded-2xl p-6 sm:col-span-2"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-lime-400/15 text-lime-300">
                <Palette size={20} />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-white">
                Kit de marca
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">
                Logo, paleta de colores (verde neón sobre negro) y
                tipografías (Bricolage Grotesque / Plus Jakarta Sans)
                disponibles bajo solicitud para uso editorial. Escríbenos a{" "}
                <a
                  href="mailto:prensa@lukea.com"
                  className="text-lime-300 hover:text-lime-200"
                >
                  prensa@lukea.com
                </a>{" "}
                y te lo enviamos.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative pb-24 sm:pb-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center gap-2">
            <Megaphone size={18} className="text-lime-300" />
            <h2 className="font-display text-2xl font-bold text-white">
              Comunicados
            </h2>
          </div>

          <div className="space-y-4">
            {announcements.map((a, i) => (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="rounded-2xl border border-white/8 bg-white/[0.02] p-5"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-white/35">
                  {a.date}
                </span>
                <h3 className="mt-1.5 font-display text-base font-semibold text-white">
                  {a.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/50">
                  {a.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
