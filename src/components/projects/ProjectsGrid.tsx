"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useUI } from "@/components/providers/UIProvider";
import { ALL_CATEGORIES, queryProjects } from "@/lib/projects";
import { ArrowUpRight, EyeIcon, SearchIcon } from "@/components/ui/Icons";

export function ProjectsGrid({ category, q }: { category: string; q: string }) {
  const { projects, openProject } = useUI();
  const router = useRouter();
  const [query, setQuery] = useState(q);

  useEffect(() => setQuery(q), [q]);

  // debounce search into the URL so filtered views are shareable
  useEffect(() => {
    if (query === q) return;
    const t = window.setTimeout(() => {
      const sp = new URLSearchParams();
      if (category !== "all") sp.set("category", category);
      if (query.trim()) sp.set("q", query.trim());
      router.replace(`/projects${sp.size ? `?${sp}` : ""}`, { scroll: false });
    }, 250);
    return () => window.clearTimeout(t);
  }, [query, q, category, router]);

  const results = useMemo(() => queryProjects({ q: query, category }, projects), [query, category, projects]);
  const href = (c: string) => {
    const sp = new URLSearchParams();
    if (c !== "all") sp.set("category", c);
    if (query.trim()) sp.set("q", query.trim());
    return `/projects${sp.size ? `?${sp}` : ""}`;
  };

  return (
    <>
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {[{ id: "all", title: "All work" }, ...ALL_CATEGORIES].map((c) => (
            <Link
              key={c.id}
              href={href(c.id)}
              scroll={false}
              className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${category === c.id ? "bg-white text-black" : "glass text-white/70 hover:text-white"}`}
            >
              {c.title}
            </Link>
          ))}
        </div>
        <label className="glass flex h-11 w-full items-center gap-2 rounded-full px-4 lg:w-80">
          <SearchIcon width={16} height={16} className="text-white/45" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Edits, VFX, Reels..." className="w-full bg-transparent text-sm outline-none placeholder:text-white/35" />
        </label>
      </div>

      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">{results.length} projects</p>

      <motion.div layout className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {results.map((p) => (
            <motion.article
              layout
              key={p.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass glass-liquid group overflow-hidden rounded-3xl p-2"
            >
              <button onClick={() => openProject(p.slug)} className="block w-full text-left" aria-label={`Play ${p.title}`}>
                <div className="relative aspect-video overflow-hidden rounded-2xl">
                  <Image src={p.thumbnail} alt={p.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="glass absolute right-3 top-3 rounded-full px-2.5 py-1 font-mono text-[10px]">{p.runtime}</span>
                  <span className="absolute bottom-3 left-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-black opacity-0 transition group-hover:opacity-100">▶</span>
                </div>
              </button>
              <div className="flex items-start justify-between gap-3 px-2 pb-2 pt-3">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">#{String(p.index).padStart(2, "0")} · {p.label}</p>
                  <h3 className="mt-1 truncate font-semibold">{p.title}</h3>
                  <p className="flex items-center gap-1.5 text-xs text-white/45">
                    {p.client} · <EyeIcon width={12} height={12} /> {Intl.NumberFormat("en", { notation: "compact" }).format(p.views)}
                  </p>
                </div>
                <Link href={`/projects/${p.slug}`} className="glass grid h-9 w-9 shrink-0 place-items-center rounded-full" aria-label={`Case study: ${p.title}`}>
                  <ArrowUpRight width={14} height={14} />
                </Link>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
      {results.length === 0 && (
        <div className="glass mt-6 rounded-3xl p-10 text-center text-white/55">
          Nothing matches yet.{" "}
          <Link href="/projects" className="underline">
            Clear filters
          </Link>
        </div>
      )}
    </>
  );
}
