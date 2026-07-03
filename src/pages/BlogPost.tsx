import { motion } from "framer-motion";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, Clock3 } from "lucide-react";
import { blogPosts, getBlogPost } from "../lib/blogPosts";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : undefined;

  if (!post) return <Navigate to="/blog" replace />;

  const currentIndex = blogPosts.findIndex((p) => p.slug === post.slug);
  const next = blogPosts[(currentIndex + 1) % blogPosts.length];

  return (
    <article className="noise-bg relative pt-40 pb-24 sm:pt-48 sm:pb-32">
      <div
        aria-hidden
        className="animate-blob absolute -top-32 -left-32 h-[24rem] w-[24rem] bg-emerald-500/15 blur-[100px]"
      />

      <div className="relative mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/45 transition-colors hover:text-white"
        >
          <ArrowLeft size={14} />
          Volver al blog
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          <span className="inline-flex items-center rounded-full bg-lime-400/10 px-3 py-1 text-[11px] font-semibold text-lime-300">
            {post.category}
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
            {post.title}
          </h1>
          <div className="mt-4 flex items-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock3 size={13} />
              {post.readMinutes} min de lectura
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass mt-8 space-y-5 rounded-[1.75rem] p-6 sm:p-10"
        >
          {post.content.map((paragraph, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-white/70">
              {paragraph}
            </p>
          ))}
        </motion.div>

        <Link
          to={`/blog/${next.slug}`}
          className="group mt-10 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/20"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/35">
              Siguiente artículo
            </p>
            <p className="mt-1 font-display text-base font-semibold text-white">
              {next.title}
            </p>
          </div>
          <ArrowRight
            size={18}
            className="shrink-0 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-lime-300"
          />
        </Link>
      </div>
    </article>
  );
}
