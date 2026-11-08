"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { GlassModal } from "@/components/ui/GlassModal";
import { useUI } from "@/components/providers/UIProvider";
import { getCategory, getProject, PROFILE, SHOWREEL, type Project } from "@/lib/projects";
import { BIO, BTS_GALLERY, OUTTAKES, RATES, TOOLS_STACK, WORKFLOW } from "@/lib/content";
import { ArrowUpRight, ClockIcon, EyeIcon, StarIcon } from "@/components/ui/Icons";

const aspectClass: Record<Project["aspectRatio"], string> = {
  "16:9": "aspect-video",
  "9:16": "aspect-[9/16] max-h-[70vh] mx-auto",
  "1:1": "aspect-square max-h-[70vh] mx-auto",
  "4:5": "aspect-[4/5] max-h-[70vh] mx-auto",
};

function fmt(n: number) {
  return Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function ProjectModal({ slug }: { slug: string }) {
  const { closeModal, openProject, projects } = useUI();
  const project = projects.find((p) => p.slug === slug) ?? getProject(slug);
  if (!project) return null;
  const cat = getCategory(project.category);
  const related = projects.filter((p) => p.category === project.category && p.slug !== project.slug).slice(0, 3);

  return (
    <GlassModal onClose={closeModal} label={project.title} className="max-w-6xl">
      <div className="grid gap-0 lg:grid-cols-[1.45fr_1fr]">
        <div className="bg-black/50 p-3 sm:p-5">
          <div className={`relative overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 ${aspectClass[project.aspectRatio]}`}>
            <video
              key={project.slug}
              src={project.videoUrl}
              poster={project.thumbnail}
              className="h-full w-full object-cover"
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {project.results.map((r) => (
              <div key={r.label} className="glass rounded-2xl px-3 py-3 text-center">
                <p className="font-display text-xl font-semibold sm:text-2xl">{r.value}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-white/45">{r.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
            <span className="h-2 w-2 rounded-full" style={{ background: project.accent }} />#{String(project.index).padStart(2, "0")} · {cat?.title}
          </div>
          <h2 className="font-display mt-3 pr-10 text-3xl font-semibold leading-tight tracking-tight">{project.title}</h2>
          <p className="mt-1 text-sm text-white/50">
            {project.client} · {project.year}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/60">
            <span className="flex items-center gap-1.5"><ClockIcon width={14} height={14} /> {project.runtime}</span>
            <span className="flex items-center gap-1.5"><EyeIcon width={14} height={14} /> {fmt(project.views)} views</span>
            <span className="flex items-center gap-1.5">{project.aspectRatio}</span>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-white/75">{project.summary}</p>

          <h3 className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Breakdown</h3>
          <ol className="mt-3 space-y-2.5">
            {project.breakdown.map((b, i) => (
              <li key={i} className="flex gap-3 text-sm text-white/70">
                <span className="font-mono text-xs text-white/35">{String(i + 1).padStart(2, "0")}</span>
                {b}
              </li>
            ))}
          </ol>

          <h3 className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Tools used</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.tools.map((t) => (
              <span key={t} className="glass rounded-full px-3 py-1 text-xs text-white/80">{t}</span>
            ))}
          </div>

          <figure className="glass mt-6 rounded-2xl p-4">
            <div className="flex gap-0.5 text-amber-300">
              {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} width={12} height={12} />)}
            </div>
            <blockquote className="mt-2 text-sm leading-relaxed text-white/80">“{project.testimonial.quote}”</blockquote>
            <figcaption className="mt-2 text-xs text-white/45">
              {project.testimonial.author} — {project.testimonial.role}
            </figcaption>
          </figure>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={`/projects/${project.slug}`} onClick={closeModal} className="focus-ring flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black">
              Full case study <ArrowUpRight width={14} height={14} />
            </Link>
            <Link href={`/projects?category=${project.category}`} onClick={closeModal} className="glass focus-ring rounded-full px-4 py-2.5 text-sm">
              More {cat?.title}
            </Link>
          </div>

          {related.length > 0 && (
            <>
              <h3 className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Related</h3>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {related.map((r) => (
                  <button key={r.slug} onClick={() => openProject(r.slug)} className="group text-left">
                    <span className="relative block aspect-video overflow-hidden rounded-xl ring-1 ring-white/10">
                      <Image src={r.thumbnail} alt={r.title} fill sizes="120px" className="object-cover transition group-hover:scale-110" />
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-white/60">{r.client}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </GlassModal>
  );
}

export function ShowreelModal() {
  const { closeModal } = useUI();
  return (
    <GlassModal onClose={closeModal} label="Master showreel" className="max-w-[1280px] bg-black/80">
      <div className="p-3 sm:p-5">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
          <video src={SHOWREEL.videoUrl} poster={SHOWREEL.poster} className="h-full w-full object-cover" controls autoPlay playsInline preload="auto" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1 pt-4">
          <div>
            <p className="font-display text-lg font-semibold">{SHOWREEL.title}</p>
            <p className="font-mono text-[11px] uppercase tracking-widest text-white/45">Runtime {SHOWREEL.runtime} · 4K · Stereo</p>
          </div>
          <Link href="/projects" onClick={closeModal} className="glass focus-ring rounded-full px-4 py-2 text-sm">
            Browse all projects →
          </Link>
        </div>
      </div>
    </GlassModal>
  );
}

export function NotesWindow() {
  const { closeModal } = useUI();
  const [tab, setTab] = useState<"about" | "workflow" | "rates">("about");
  return (
    <GlassModal onClose={closeModal} label="About Arham Sadik, workflow and rate card" variant="light" className="max-w-3xl">
      <div className="flex items-center gap-2 border-b border-black/5 px-5 py-3.5">
        <button onClick={closeModal} aria-label="Close window" className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs font-medium text-slate-500">Notes — about_arham.md</span>
      </div>
      <div className="grid sm:grid-cols-[180px_1fr]">
        <aside className="flex gap-1 border-black/5 p-3 sm:flex-col sm:border-r">
          {(["about", "workflow", "rates"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-3 py-2 text-left text-sm capitalize transition ${tab === t ? "bg-amber-300/70 font-medium" : "hover:bg-black/5"}`}
            >
              {t === "rates" ? "Rate Card" : t}
            </button>
          ))}
        </aside>
        <div className="min-h-[380px] p-6">
          {tab === "about" && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="font-display text-2xl font-semibold">About {PROFILE.name}</h3>
              {BIO.map((b, i) => (
                <p key={i} className="mt-3 text-sm leading-relaxed text-slate-600">{b}</p>
              ))}
              <div className="mt-5 flex flex-wrap gap-1.5">
                {TOOLS_STACK.map((t) => (
                  <span key={t} className="rounded-full bg-black/5 px-2.5 py-1 text-xs text-slate-700">{t}</span>
                ))}
              </div>
              <Link href="/about" onClick={closeModal} className="mt-5 inline-block text-sm font-medium text-violet-700 underline-offset-4 hover:underline">
                Open full about page →
              </Link>
            </motion.div>
          )}
          {tab === "workflow" && (
            <motion.ol initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {WORKFLOW.map((w) => (
                <li key={w.step} className="flex gap-4">
                  <span className="font-mono text-xs text-slate-400">{w.step}</span>
                  <div>
                    <p className="font-semibold">{w.title}</p>
                    <p className="text-sm text-slate-600">{w.body}</p>
                  </div>
                </li>
              ))}
            </motion.ol>
          )}
          {tab === "rates" && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="grid gap-3 sm:grid-cols-2">
              {RATES.map((r) => (
                <div key={r.name} className="rounded-2xl bg-white/70 p-4 ring-1 ring-black/5">
                  <p className="text-sm font-medium text-slate-500">{r.name}</p>
                  <p className="font-display mt-1 text-2xl font-semibold">
                    {r.price} <span className="text-sm font-normal text-slate-400">{r.unit}</span>
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-600">
                    {r.features.map((f) => <li key={f}>✓ {f}</li>)}
                  </ul>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </GlassModal>
  );
}

export function GalleryModal() {
  const { closeModal } = useUI();
  const [active, setActive] = useState(0);
  const item = BTS_GALLERY[active];
  return (
    <GlassModal onClose={closeModal} label="Behind the scenes gallery" className="max-w-5xl">
      <div className="p-5 sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/45">Photos</p>
        <h3 className="font-display mt-1 text-2xl font-semibold">Behind-The-Scenes & Timeline Breakdown</h3>
        <motion.div key={active} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative mt-5 aspect-video overflow-hidden rounded-2xl ring-1 ring-white/10">
          <Image src={item.src} alt={item.title} fill sizes="(max-width: 1024px) 100vw, 960px" className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-5">
            <p className="font-semibold">{item.title}</p>
            <p className="text-sm text-white/70">{item.caption}</p>
          </div>
          <button onClick={() => setActive((a) => (a - 1 + BTS_GALLERY.length) % BTS_GALLERY.length)} className="glass absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full" aria-label="Previous photo">‹</button>
          <button onClick={() => setActive((a) => (a + 1) % BTS_GALLERY.length)} className="glass absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full" aria-label="Next photo">›</button>
        </motion.div>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {BTS_GALLERY.map((g, i) => (
            <button key={g.src} onClick={() => setActive(i)} className={`relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg ring-2 transition ${i === active ? "ring-white" : "ring-transparent opacity-60 hover:opacity-100"}`}>
              <Image src={g.src} alt={g.title} fill sizes="112px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    </GlassModal>
  );
}

export function TrashModal() {
  const { closeModal, toast } = useUI();
  const [items, setItems] = useState(OUTTAKES);
  return (
    <GlassModal onClose={closeModal} label="Rejected rough cuts and outtakes" variant="light" className="max-w-lg">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🗑️</span>
          <div>
            <h3 className="font-display text-xl font-semibold">Rejected Rough Cuts & Outtakes</h3>
            <p className="text-xs text-slate-500">{items.length} items · the cuts that taught me the most</p>
          </div>
        </div>
        <ul className="mt-5 space-y-2">
          {items.map((o) => (
            <motion.li layout key={o.title} className="rounded-xl bg-white/70 p-3 ring-1 ring-black/5">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate font-mono text-xs font-semibold text-slate-800">{o.title}</p>
                <span className="font-mono text-[10px] text-slate-400">{o.duration}</span>
              </div>
              <p className="mt-1 text-xs text-slate-600">{o.reason}</p>
            </motion.li>
          ))}
        </ul>
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => {
              setItems([]);
              toast({ kind: "info", title: "Trash emptied", description: "Just kidding — I keep everything. 🎞️" });
              window.setTimeout(() => setItems(OUTTAKES), 1800);
            }}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Empty Trash
          </button>
          <button onClick={closeModal} className="rounded-full bg-black/5 px-4 py-2 text-sm">Put back</button>
        </div>
      </div>
    </GlassModal>
  );
}
