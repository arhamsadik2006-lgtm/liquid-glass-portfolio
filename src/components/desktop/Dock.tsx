// src/components/desktop/Dock.tsx
"use client";

import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import type { DockGroup } from "@/lib/projects";
import { AeIcon, AiIcon, InstagramAppIcon, MailAppIcon, NotesIcon, PhotosIcon, PsIcon, ShowreelIcon, TrashAppIcon } from "./AppIcons";

export interface DockItem {
  id: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  active?: boolean;
  href?: string;
}

function DockIcon({ item, mouseX }: { item: DockItem; mouseX: MotionValue<number> }) {
  const ref = useRef<HTMLDivElement>(null);
  const centerX = useRef<number>(0);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const measure = () => {
      const b = ref.current?.getBoundingClientRect();
      if (b) centerX.current = b.left + b.width / 2;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const distance = useTransform(mouseX, (x) => {
    if (!Number.isFinite(x) || !centerX.current) return 999;
    return x - centerX.current;
  });

  const size = useSpring(useTransform(distance, [-150, 0, 150], [50, 74, 50], { clamp: true }), {
    stiffness: 260,
    damping: 28,
    mass: 0.4,
  });
  const lift = useTransform(size, [50, 74], [0, -10]);

  const content = (
    <motion.div
      ref={ref}
      style={{ width: size, height: size, y: lift }}
      className="relative will-change-transform"
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileTap={{ scale: 0.92 }}
    >
      {item.icon}
      <motion.span
        initial={false}
        animate={{ opacity: hover ? 1 : 0, y: hover ? 0 : 6 }}
        className="glass glass-light pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-800"
      >
        {item.label}
      </motion.span>
      {item.active && <span className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-slate-800" />}
    </motion.div>
  );

  if (item.href) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label} className="focus-ring rounded-2xl" onClick={item.onClick}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" aria-label={item.label} aria-pressed={item.active} onClick={item.onClick} className="focus-ring rounded-2xl">
      {content}
    </button>
  );
}

export function Dock({ groups }: { groups: DockItem[][] }) {
  const mouseX = useMotionValue(Infinity);
  return (
    <motion.nav
      aria-label="Creator dock"
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="glass glass-light no-scrollbar mx-auto flex h-[74px] w-fit max-w-[calc(100vw-24px)] items-end gap-2.5 overflow-x-auto rounded-[26px] px-3 pb-3 pt-6 max-sm:h-[96px] sm:gap-3 sm:overflow-visible sm:px-4 sm:pt-0"
    >
      {groups.map((g, gi) => (
        <Fragment key={gi}>
          {gi > 0 && <span className="mb-1 h-10 w-px shrink-0 self-end bg-gradient-to-b from-transparent via-slate-400/60 to-transparent" />}
          {g.map((item) => (
            <DockIcon key={item.id} item={item} mouseX={mouseX} />
          ))}
        </Fragment>
      ))}
    </motion.nav>
  );
}

export const DOCK_ICON_MAP: Record<DockGroup, () => ReactNode> = {
  ae: () => <AeIcon />,
  ps: () => <PsIcon />,
  ai: () => <AiIcon />,
};

export { ShowreelIcon, NotesIcon, PhotosIcon, InstagramAppIcon, MailAppIcon, TrashAppIcon };