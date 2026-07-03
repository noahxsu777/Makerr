import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock3 } from "lucide-react";
import PageHero from "../components/PageHero";
import { blogPosts } from "../lib/blogPosts";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Blog() {
  return (
    <>
      <PageHero
        eyebrow="Blog de Lukea"
        title="Ideas, guías y novedades sobre enviar dinero"
        subtitle="Transparencia, seguridad y todo lo que aprendemos construyendo una remesadora mejor."
      />

      <section className="relative pb-24 sm:pb-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2">
            {blogPosts.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-white/8 bg-white/[0.02] p-6 transition-colors hover:border-white/20"
                >
                  <span className="inline-flex w-fit items-center rounded-full bg-lime-400/10 px-3 py-1 text-[11px] font-semibold text-lime-300">
                    {post.category}
                  </span>
                  <h2 className="mt-4 font-display text-xl font-bold text-white">
                    {post.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/50">
                    {post.excerpt}
                  </p>
                  <div className="mt-5 flex items-center justify-between text-xs text-white/35">
                    <span className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(post.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock3 size={12} />
                        {post.readMinutes} min
                      </span>
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-white/60 transition-colors group-hover:text-lime-300">
                      Leer
                      <ArrowRight
                        size={13}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
