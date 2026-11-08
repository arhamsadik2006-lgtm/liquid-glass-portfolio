"use client";

import React, { useEffect, useRef, useState } from "react";

/** Lazily attaches the src when near viewport, auto-plays muted loops, pauses offscreen. */
export function LazyVideo({
  src,
  poster,
  className = "",
  rootMargin = "200px",
}: {
  src: string;
  poster?: string;
  className?: string;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    if (active) ref.current?.play().catch(() => {});
  }, [active]);

  if (failed && poster) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={poster} alt="" className={className} />;
  }

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      src={active ? src : undefined}
      muted
      loop
      playsInline
      preload="none"
      onError={() => setFailed(true)}
    />
  );
}