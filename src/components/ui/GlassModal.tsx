"use client";

import React, { type ReactNode } from "react";
import { motion } from "framer-motion";
import { CloseIcon } from "./Icons";

/** Full-screen liquid-glass modal shell with backdrop and spring entrance. */
export function GlassModal({
  onClose,
  children,
  label,
  className = "",
  variant = "dark",
  position = "center",
}: {
  onClose: () => void;
  children: ReactNode;
  label: string;
  className?: string;
  variant?: "dark" | "light";
  position?: "center" | "right";
}) {
  return (
    <motion.div
      className={`fixed inset-0 z-[150] flex ${position === "right" ? "justify-end" : "items-center justify-center"} p-3 sm:p-6`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <motion.button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={position === "right" ? { x: 80, opacity: 0 } : { y: 40, scale: 0.94, opacity: 0, filter: "blur(10px)" }}
        animate={position === "right" ? { x: 0, opacity: 1 } : { y: 0, scale: 1, opacity: 1, filter: "blur(0px)" }}
        exit={position === "right" ? { x: 80, opacity: 0 } : { y: 30, scale: 0.96, opacity: 0, filter: "blur(8px)" }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className={`glass ${variant === "light" ? "glass-light text-slate-900" : "glass-dark text-white"} relative flex max-h-full w-full flex-col overflow-hidden rounded-[28px] ${className}`}
      >
        <button
          type="button"
          onClick={onClose}
          className={`focus-ring absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full ${
            variant === "light" ? "bg-black/5 hover:bg-black/10" : "bg-white/10 hover:bg-white/20"
          } transition`}
          aria-label="Close"
        >
          <CloseIcon width={16} height={16} />
        </button>
        <div data-lenis-prevent="true" className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}