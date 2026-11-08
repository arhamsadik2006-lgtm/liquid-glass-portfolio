"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollState } from "@/lib/scroll-store";

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollCtx {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, opts?: { offset?: number; immediate?: boolean }) => void;
  stop: () => void;
  start: () => void;
}

const Ctx = createContext<SmoothScrollCtx>({
  lenis: null,
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
});

export function useSmoothScroll() {
  return useContext(Ctx);
}

/**
 * Lenis inertia scrolling driven by the GSAP ticker so Lenis, ScrollTrigger and
 * every R3F canvas (frameloop="never" + advance) share ONE requestAnimationFrame.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lockCount = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const instance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reduced,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
      autoRaf: false,
    });

    instance.on("scroll", (l: Lenis) => {
      scrollState.velocity = l.velocity;
      ScrollTrigger.update();
    });

    const tick = (time: number) => {
      instance.raf(time * 1000);
      scrollState.smoothVelocity += (scrollState.velocity - scrollState.smoothVelocity) * 0.12;
      if (!instance.isScrolling) scrollState.velocity *= 0.9;
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("load", onResize);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("load", onResize);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  const scrollTo = useCallback<SmoothScrollCtx["scrollTo"]>(
    (target, opts) => {
      if (lenis) {
        lenis.scrollTo(target, { offset: opts?.offset ?? 0, immediate: opts?.immediate, duration: 1.6 });
      } else if (typeof target === "string") {
        document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
      }
    },
    [lenis],
  );

  const stop = useCallback(() => {
    lockCount.current += 1;
    lenis?.stop();
  }, [lenis]);
  const start = useCallback(() => {
    lockCount.current = Math.max(0, lockCount.current - 1);
    if (lockCount.current === 0) lenis?.start();
  }, [lenis]);

  const value = useMemo(() => ({ lenis, scrollTo, stop, start }), [lenis, scrollTo, stop, start]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
