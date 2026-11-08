import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BIO, RATES, TOOLS_STACK, WORKFLOW } from "@/lib/content";
import { PROFILE, PROJECTS } from "@/lib/projects";
import { CaseStudyActions } from "@/components/projects/CaseStudyActions";

export const metadata: Metadata = {
  title: "About",
  description: "About Arham Sadik — workflow, toolkit and rate card.",
};

export default function AboutPage() {
  const totalViews = PROJECTS.reduce((s, p) => s + p.views, 0);
  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-24 pt-32 sm:px-8">
      <div className="grid-canvas grid-fade pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="glass relative aspect-[4/5] overflow-hidden rounded-[32px] p-2">
            <div className="relative h-full w-full overflow-hidden rounded-[26px]">
              <Image src={PROFILE.portrait} alt="Portrait of Arham Sadik" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" style={{ objectPosition: "45% 50%" }} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs">
                  <span className="pulse-dot h-2 w-2 rounded-full bg-emerald-400" /> {PROFILE.availability}
                </span>
              </div>
            </div>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/45">About</p>
            <h1 className="font-display mt-3 text-[clamp(2.4rem,5.5vw,4.6rem)] font-semibold leading-[0.95] tracking-tight">
              {PROFILE.name}
              <span className="block text-white/35">{PROFILE.role}</span>
            </h1>
            {BIO.map((b, i) => (
              <p key={i} className="mt-5 leading-relaxed text-white/70">{b}</p>
            ))}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { v: PROFILE.hoursEdited, l: "Hours edited" },
                { v: Intl.NumberFormat("en", { notation: "compact" }).format(totalViews), l: "Total views" },
                { v: `${PROJECTS.length}`, l: "Featured projects" },
              ].map((s) => (
                <div key={s.l} className="glass rounded-2xl p-4 text-center">
                  <p className="font-display text-2xl font-semibold">{s.v}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/45">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {TOOLS_STACK.map((t) => (
                <span key={t} className="glass rounded-full px-3 py-1 text-xs text-white/75">{t}</span>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-24">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Workflow</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {WORKFLOW.map((w) => (
              <div key={w.step} className="glass glass-liquid rounded-3xl p-5">
                <p className="font-mono text-xs text-white/40">{w.step}</p>
                <p className="mt-3 font-semibold">{w.title}</p>
                <p className="mt-2 text-sm text-white/55">{w.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Rate card</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {RATES.map((r, i) => (
              <div key={r.name} className={`glass glass-liquid rounded-3xl p-6 ${i === 3 ? "ring-1 ring-violet-400/50" : ""}`}>
                <p className="text-sm text-white/55">{r.name}</p>
                <p className="font-display mt-2 text-3xl font-semibold">
                  {r.price} <span className="text-sm font-normal text-white/40">{r.unit}</span>
                </p>
                <ul className="mt-4 space-y-2 text-sm text-white/65">
                  {r.features.map((f) => <li key={f}>✓ {f}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-10 max-w-sm">
            <CaseStudyActions />
          </div>
          <p className="mt-6 text-center text-sm text-white/40">
            Prefer to browse first? <Link href="/projects" className="underline">See all projects</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
