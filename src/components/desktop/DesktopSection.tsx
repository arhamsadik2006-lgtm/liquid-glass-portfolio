"use client";

import React, { useRef, useState, type PointerEvent as RPointerEvent, type RefObject } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useUI } from "@/components/providers/UIProvider";
import { DOCK_FILTERS, PROFILE, type DockGroup, type Project } from "@/lib/projects";
import {
  Dock,
  DOCK_ICON_MAP,
  InstagramAppIcon,
  MailAppIcon,
  NotesIcon,
  PhotosIcon,
  ShowreelIcon,
  TrashAppIcon,
  type DockItem,
} from "./Dock";

type Shape = "sq" | "wide" | "tall";

const LAYOUT: [number, number, Shape][] = [
  [8, 13, "wide"],
  [22, 7, "sq"],
  [36, 15, "sq"],
  [50, 6, "sq"],
  [64, 11, "wide"],
  [79, 9, "sq"],
  [91, 22, "tall"],
  [7, 37, "sq"],
  [19, 30, "tall"],
  [31, 42, "wide"],
  [72, 33, "sq"],
  [86, 44, "wide"],
  [10, 60, "wide"],
  [24, 56, "sq"],
  [39, 66, "sq"],
  [61, 62, "wide"],
  [75, 56, "sq"],
  [91, 66, "sq"],
  [15, 79, "sq"],
  [31, 82, "wide"],
  [67, 80, "sq"],
  [83, 81, "wide"],
];

const SIZE: Record<Shape, string> = {
  sq: "w-[clamp(64px,8vw,112px)] aspect-square",
  wide: "w-[clamp(92px,11.5vw,160px)] aspect-[16/10]",
  tall: "w-[clamp(60px,7vw,100px)] aspect-[3/4]",
};

function DesktopNode({
  project,
  pos,
  dimmed,
  constraints,
}: {
  project: Project;
  pos: [number, number, Shape];
  dimmed: boolean;
  constraints: RefObject<HTMLDivElement | null>;
}) {
  const { openProject } = useUI();
  const dragged = useRef(false);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 180, damping: 26, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 180, damping: 26, mass: 0.6 });

  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (dragged.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.12);
    my.set((e.clientY - (r.top + r.height / 2)) * 0.12);
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${pos[0]}%`, top: `${22 + pos[1] * 0.72}%` }}
      drag
      dragConstraints={constraints}
      dragElastic={0.12}
      dragMomentum={false}
      whileDrag={{ scale: 1.06, zIndex: 40 }}
      onPointerDown={() => {
        dragged.current = false;
        reset();
      }}
      onDragStart={() => {
        dragged.current = true;
        reset();
      }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{
        opacity: dimmed ? 0.18 : 1,
        scale: dimmed ? 0.88 : 1,
        filter: dimmed ? "grayscale(1)" : "grayscale(0)",
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <motion.div
        style={{ x: sx, y: sy }}
        className="group flex cursor-grab flex-col items-center will-change-transform active:cursor-grabbing"
      >
        <button
          type="button"
          onClick={() => {
            if (!dragged.current) openProject(project.slug);
          }}
          className={`focus-ring relative ${SIZE[pos[2]]} overflow-hidden rounded-[14px] bg-white p-[3px] shadow-[0_14px_30px_-12px_rgba(15,23,42,0.45),0_0_0_1px_rgba(15,23,42,0.06)] transition-shadow group-hover:shadow-[0_22px_40px_-14px_rgba(15,23,42,0.6),0_0_0_2px_rgba(124,58,237,0.6)]`}
          aria-label={`Open case study: ${project.title}`}
        >
          <span className="relative block h-full w-full overflow-hidden rounded-[11px]">
            <Image
              src={project.thumbnail}
              alt=""
              fill
              sizes="160px"
              draggable={false}
              className="pointer-events-none select-none object-cover transition duration-500 group-hover:scale-105"
            />
          </span>
        </button>
        <span className="mt-2 max-w-[150px] select-none text-center font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-700 sm:text-[10px]">
          {project.label}
        </span>
      </motion.div>
    </motion.div>
  );
}

export function DesktopSection() {
  const { projects, openModal } = useUI();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<DockGroup | null>(null);

  const toggle = (g: DockGroup) => setFilter((f) => (f === g ? null : g));
  const filterItem = (g: DockGroup): DockItem => ({
    id: g,
    label: `${DOCK_FILTERS[g].label} — ${DOCK_FILTERS[g].description}`,
    icon: DOCK_ICON_MAP[g](),
    onClick: () => toggle(g),
    active: filter === g,
  });

  const groups: DockItem[][] = [
    [filterItem("ae"), filterItem("ps"), filterItem("ai")],
    [
      { id: "showreel", label: "Master Showreel (60s)", icon: <ShowreelIcon />, onClick: () => openModal({ type: "showreel" }) },
      { id: "notes", label: "About, Workflow & Rate Card", icon: <NotesIcon />, onClick: () => openModal({ type: "notes" }) },
      { id: "photos", label: "Behind the Scenes", icon: <PhotosIcon />, onClick: () => openModal({ type: "gallery" }) },
    ],
    [
      { id: "instagram", label: PROFILE.instagramHandle, icon: <InstagramAppIcon />, onClick: () => {}, href: PROFILE.instagram },
      { id: "mail", label: "Quick Message", icon: <MailAppIcon />, onClick: () => openModal({ type: "quick-message" }) },
    ],
    [{ id: "trash", label: "Rejected Rough Cuts", icon: <TrashAppIcon />, onClick: () => openModal({ type: "trash" }) }],
  ];

  const visible = projects.slice(0, LAYOUT.length);
  const matchCount = filter ? visible.filter((p) => p.dock.includes(filter)).length : visible.length;

  return (
    <section id="desktop" className="relative bg-[#F2F3F5] text-slate-900" aria-label="Creator desktop">
      <div className="pointer-events-none absolute inset-x-0 -top-[40vh] h-[40vh] bg-gradient-to-b from-black to-[#F2F3F5]" />
      <div ref={canvasRef} className="relative h-[100svh] min-h-[760px] w-full overflow-hidden">
        {/* blurred portrait backdrop */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-[86%] w-[min(1100px,96vw)]">
            <Image
              src={PROFILE.portrait}
              alt="Side-profile portrait of Arham Sadik"
              fill
              sizes="(max-width: 1100px) 96vw, 1100px"
              className="object-contain opacity-90"
              style={{ filter: "blur(12px) saturate(1.05)" }}
            />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#F2F3F5_78%)]" />
        </div>

        <div className="pointer-events-none absolute left-1/2 top-24 z-20 -translate-x-1/2 text-center sm:top-28">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-slate-500">03 — The Creator Desktop</p>
          <AnimatePresence mode="wait">
            {filter ? (
              <motion.button
                key={filter}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                onClick={() => setFilter(null)}
                className="glass glass-light pointer-events-auto mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-slate-800"
              >
                {DOCK_FILTERS[filter].description} · {matchCount} projects <span className="text-slate-400">✕</span>
              </motion.button>
            ) : (
              <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 text-xs text-slate-500">
                Drag the files around · click to open · use the dock to filter
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {visible.map((p, i) => (
          <DesktopNode
            key={p.slug}
            project={p}
            pos={LAYOUT[i] ?? [50, 50, "sq"]}
            constraints={canvasRef}
            dimmed={Boolean(filter && !p.dock.includes(filter))}
          />
        ))}

        <div className="absolute inset-x-0 bottom-5 z-30 px-3">
          <Dock groups={groups} />
        </div>
      </div>
    </section>
  );
}