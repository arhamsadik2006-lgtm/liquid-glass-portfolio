"use client";

import React, { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { CATEGORIES, type Category } from "@/lib/projects";
import { useUI } from "@/components/providers/UIProvider";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";

const FAN_LAYOUT = [
  { x: -370, y: 58, rotate: -15, scale: 0.9 },
  { x: -190, y: 20, rotate: -7.5, scale: 0.95 },
  { x: 0, y: 0, rotate: 0, scale: 1 },
  { x: 190, y: 20, rotate: 7.5, scale: 0.95 },
  { x: 370, y: 58, rotate: 15, scale: 0.9 },
];

function FanCard({
  cat,
  i,
  hoveredIndex,
  setHoveredIndex,
  onSelect,
}: {
  cat: Category;
  i: number;
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
  onSelect: (cat: Category) => void;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const base = FAN_LAYOUT[i] ?? { x: 0, y: 0, rotate: 0, scale: 1 };
  const isHovered = hoveredIndex === i;
  const isCenter = i === 2;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), {
    stiffness: 260,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-16, 16]), {
    stiffness: 260,
    damping: 22,
  });
  const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  let targetX = base.x;
  let targetY = base.y;
  let targetRotate = base.rotate;
  let targetScale = base.scale;

  if (hoveredIndex !== null) {
    if (isHovered) {
      targetY = base.y - 44;
      targetRotate = 0;
      targetScale = 1.1;
    } else {
      const dir = i < hoveredIndex ? -1 : 1;
      const dist = Math.abs(i - hoveredIndex);
      targetX = base.x + dir * (dist === 1 ? 46 : 24);
      targetY = base.y + 12;
      targetRotate = base.rotate + dir * 3;
      targetScale = base.scale * 0.96;
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(nx);
    mouseY.set(ny);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.button
      ref={cardRef}
      type="button"
      onClick={() => onSelect(cat)}
      onMouseEnter={() => setHoveredIndex(i)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label={cat.title}
      initial={{ opacity: 0, y: 120, rotate: 0, scale: 0.85 }}
      animate={{
        opacity: 1,
        x: targetX,
        y: targetY,
        rotate: targetRotate,
        scale: targetScale,
      }}
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 22,
        mass: 0.85,
      }}
      style={{
        zIndex: isHovered ? 50 : isCenter ? 30 : 20 - Math.abs(i - 2),
        perspective: 1100,
      }}
      className="group absolute left-1/2 top-6 -ml-[115px] h-[330px] w-[230px] cursor-pointer select-none rounded-[26px] border-0 bg-transparent p-0 focus:outline-none sm:-ml-[130px] sm:h-[370px] sm:w-[260px]"
    >
      <motion.div
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          clipPath: "inset(0 round 26px)",
          WebkitMaskImage: "-webkit-radial-gradient(white, black)",
          boxShadow: isHovered
            ? "0 45px 95px -15px rgba(0,0,0,0.9), 0 0 38px 2px rgba(168,85,247,0.38)"
            : "0 30px 60px -20px rgba(0,0,0,0.85)",
        }}
        className="relative h-full w-full overflow-hidden rounded-[26px] border border-white/15 bg-[#12131a]/90 p-2 transition-shadow duration-300"
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-[20px]"
          style={{
            background: cat.gradient,
            clipPath: "inset(0 round 20px)",
          }}
        >
          <Image
            src={cat.poster}
            alt={cat.title}
            fill
            sizes="260px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />

          <div
            className="
              absolute inset-0 opacity-35 mix-blend-color
              transition-opacity duration-500
              group-hover:opacity-10
            "
            style={{ background: cat.gradient }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

          <motion.div
            className="
              pointer-events-none absolute inset-0 opacity-0
              transition-opacity duration-300
              group-hover:opacity-100
            "
            style={{
              background: useTransform(
                [glareX, glareY],
                ([gx, gy]) =>
                  `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.06) 38%, transparent 70%)`
              ),
            }}
          />

          <div
            className="
              absolute inset-x-3 top-3 flex items-center justify-between
              rounded-full border border-white/10 bg-black/65 px-3 py-1.5
              backdrop-blur-md transition-transform duration-300
              group-hover:translate-y-0.5
            "
          >
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-300">
              ★ {isCenter ? "FEATURED" : cat.rating.toFixed(1)}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-white/40 transition-colors group-hover:bg-emerald-400" />
          </div>

          <div className="absolute inset-x-4 bottom-4 text-left transition-transform duration-300 group-hover:-translate-y-1">
            <h3 className="font-display text-lg font-semibold leading-tight text-white drop-shadow-sm">
              {cat.title}
            </h3>
            <p className="mt-1 line-clamp-1 text-xs text-white/75 group-hover:text-white">
              {cat.subtitle}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.button>
  );
}

export function FannedCards() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { openModal } = useUI();
  const { scrollTo } = useSmoothScroll();

  const handleSelect = (cat: Category) => {
    if (cat.id === "commercial") {
      openModal({ type: "showreel" });
    } else {
      scrollTo("#work");
    }
  };

  return (
    <div className="relative z-30 mx-auto mt-10 h-[390px] w-full max-w-5xl overflow-visible sm:h-[430px]">
      {CATEGORIES.slice(0, 5).map((cat, i) => (
        <FanCard
          key={cat.id}
          cat={cat}
          i={i}
          hoveredIndex={hoveredIndex}
          setHoveredIndex={setHoveredIndex}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}

export default FannedCards;