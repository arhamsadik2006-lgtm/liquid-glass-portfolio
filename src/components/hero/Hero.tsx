"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useUI } from "@/components/providers/UIProvider";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { FannedCards } from "./FannedCards";
import { PlayIcon, ArrowUpRight } from "@/components/ui/Icons";
import { PROFILE } from "@/lib/projects";
import { scrollState } from "@/lib/scroll-store";

const HeroAccents = dynamic(() => import("@/components/three/HeroAccents"), { ssr: false });

const fade = (d: number) => ({
  initial: { opacity: 0, y: 24, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.9, delay: d, ease: [0.22, 1, 0.36, 1] as const },
});

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const activeRef = useRef(true);
  const { openModal } = useUI();
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      activeRef.current = e.isIntersecting;
      scrollState.heroVisible = e.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="top"
      className="relative z-20 flex min-h-[100svh] flex-col overflow-x-clip overflow-y-visible pb-16 pt-28 sm:pt-32"
    >
      {/* grid canvas + atmosphere */}
      <div className="grid-canvas grid-fade pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[380px] w-[1100px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[120px]" />

      {/* grid-square frames for the 3D accents */}
      <div className="pointer-events-none absolute left-[14%] top-[42%] hidden h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-white/[0.02] md:block">
        <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-white/40" />
        <span className="absolute -bottom-6 left-0 font-mono text-[10px] uppercase tracking-widest text-white/35">CAM_A · 35mm</span>
      </div>
      <div className="pointer-events-none absolute left-[86%] top-[42%] hidden h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-white/[0.02] md:block">
        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-cyan-300/60" />
        <span className="absolute -bottom-6 right-0 font-mono text-[10px] uppercase tracking-widest text-white/35">KF 00:01:24:12</span>
      </div>

      <div className="pointer-events-none absolute inset-0">
        <HeroAccents activeRef={activeRef} />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-5 text-center">
        <motion.button
          {...fade(0.05)}
          onClick={() => openModal({ type: "booking" })}
          className="glass glass-liquid focus-ring flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-white/80 hover:text-white"
        >
          <span className="pulse-dot h-2 w-2 rounded-full bg-emerald-400" />
          {PROFILE.availability}
        </motion.button>

        <motion.h1
          {...fade(0.15)}
          className="font-display mt-6 text-[clamp(2.6rem,8.2vw,7.2rem)] font-semibold leading-[0.92] tracking-[-0.045em]"
        >
          <span className="display-gradient block">Cinematic Edits</span>
          <span className="block text-white/35">
            <span className="text-white/90">/</span> Arham Sadik
          </span>
        </motion.h1>

        <motion.p {...fade(0.3)} className="text-muted mt-6 max-w-xl text-[clamp(0.95rem,1.3vw,1.1rem)] leading-relaxed">
          Programmatic motion graphics and commercial storytelling,
          <br className="hidden sm:block" /> engineered for high-retention edits that hold attention to the final frame.
        </motion.p>

        <motion.div {...fade(0.42)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => openModal({ type: "showreel" })}
            className="focus-ring group flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.03]"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-black text-white">
              <PlayIcon width={11} height={11} />
            </span>
            Watch 60s Showreel
          </button>
          <button
            onClick={() => scrollTo("#contact")}
            className="glass glass-liquid focus-ring flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white"
          >
            Start a Project <ArrowUpRight width={15} height={15} />
          </button>
        </motion.div>
      </div>

      <div className="relative z-30 mt-auto overflow-visible pt-12">
        <FannedCards />
      </div>
    </section>
  );
}