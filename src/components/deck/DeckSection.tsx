"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useUI } from "@/components/providers/UIProvider";
import { scrollState } from "@/lib/scroll-store";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const DeckScene = dynamic(() => import("@/components/three/DeckScene"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

function FallbackGrid() {
  const { projects, openProject } = useUI();
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div className="mx-auto mt-28 grid max-w-6xl grid-cols-2 gap-4 px-5 sm:grid-cols-4">
        {projects.slice(0, 8).map((p) => (
          <button
            key={p.slug}
            onClick={() => openProject(p.slug)}
            className="glass glass-liquid overflow-hidden rounded-2xl p-1.5 text-left"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image src={p.thumbnail} alt={p.title} fill sizes="25vw" className="object-cover" />
            </div>
            <div className="flex items-center justify-between px-2 py-2 font-mono text-[10px] text-white/70">
              <span>#{String(p.index).padStart(2, "0")} {p.client}</span>
              <span>{p.runtime}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function DeckSection() {
  const wrapRef = useRef<HTMLElement>(null);
  const activeRef = useRef(false);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);
  const { projects, openProject } = useUI();

  // Lazy-mount the WebGL scene when approaching; render only while visible
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const near = new IntersectionObserver(([e]) => e.isIntersecting && setMounted(true), { rootMargin: "100% 0px" });
    const vis = new IntersectionObserver(([e]) => {
      activeRef.current = e.isIntersecting;
      scrollState.deckVisible = e.isIntersecting;
    });
    near.observe(el);
    vis.observe(el);
    return () => {
      near.disconnect();
      vis.disconnect();
    };
  }, []);

  // ScrollTrigger scrub: deck progress + overlay choreography
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          scrollState.deckProgress = self.progress;
        },
      });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });
      tl.fromTo(".deck-intro", { opacity: 1, y: 0 }, { opacity: 0, y: -40, duration: 0.25 }, 0.12)
        .fromTo(".deck-inspect", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.1 }, 0.36)
        .to(".deck-inspect", { opacity: 0, y: -30, duration: 0.1 }, 0.62)
        .fromTo(".deck-cascade", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.1 }, 0.72)
        .fromTo(".deck-progress-bar", { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "none" }, 0);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={wrapRef} id="showreel" className="relative h-[520vh] bg-black" aria-label="Selected work — 3D glass deck">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-40 bg-gradient-to-b from-transparent to-black" />
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <div className="absolute inset-0">
          {mounted && (
            <ErrorBoundary label="deck" fallback={<FallbackGrid />}>
              <DeckScene projects={projects} activeRef={activeRef} counterRef={counterRef} fallback={<FallbackGrid />} />
            </ErrorBoundary>
          )}
        </div>

        {/* Overlay copy */}
        <div className="pointer-events-none absolute inset-x-0 top-24 z-10 px-6 sm:top-28 sm:px-10">
          <div className="deck-intro max-w-md">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/45">02 — Selected Work</p>
            <h2 className="font-display mt-3 text-[clamp(2rem,4.4vw,3.6rem)] font-semibold leading-[0.95] tracking-tight">
              {projects.length} edits.
              <br />
              <span className="text-white/40">One continuous take.</span>
            </h2>
          </div>
          <div className="deck-inspect absolute left-6 top-0 max-w-sm opacity-0 sm:left-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-300/80">● Rack focus</p>
            <h3 className="font-display mt-3 text-3xl font-semibold tracking-tight">Slow down to inspect.</h3>
            <p className="mt-2 text-sm text-white/50">Click any glass card to open its full breakdown.</p>
          </div>
          <div className="deck-cascade absolute right-6 top-0 max-w-sm text-right opacity-0 sm:right-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-violet-300/80">S-curve cascade</p>
            <h3 className="font-display mt-3 text-3xl font-semibold tracking-tight">Every frame, intentional.</h3>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex items-end justify-between gap-4 px-6 sm:px-10">
          <div className="glass pointer-events-auto rounded-full px-4 py-2 font-mono text-[11px] text-white/75">
            <span ref={counterRef}>01 / {String(projects.length).padStart(2, "0")}</span>
          </div>
          <div className="mb-3 hidden h-px flex-1 bg-white/10 sm:block">
            <div className="deck-progress-bar h-px origin-left bg-white/70" />
          </div>
          <p className="hidden font-mono text-[11px] uppercase tracking-[0.25em] text-white/40 sm:block">Scroll ↓ to sweep</p>
        </div>

        {/* Accessible list of deck items */}
        <ul className="sr-only">
          {projects.map((p) => (
            <li key={p.slug}>
              <button onClick={() => openProject(p.slug)}>
                Open {p.title} by {p.client}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
