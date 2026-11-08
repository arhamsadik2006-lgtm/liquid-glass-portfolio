"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Project } from "@/lib/projects";
import { PROJECTS } from "@/lib/projects";
import { useSmoothScroll } from "./SmoothScroll";

export type ModalState =
  | { type: "project"; slug: string }
  | { type: "search"; query?: string; category?: string }
  | { type: "showreel" }
  | { type: "notes" }
  | { type: "gallery" }
  | { type: "trash" }
  | { type: "quick-message" }
  | { type: "booking" }
  | null;

const SIMPLE_MODALS = ["showreel", "notes", "gallery", "trash", "quick-message", "booking", "search"] as const;

export type ToastKind = "info" | "success" | "error" | "loading";
interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
}

interface UICtx {
  modal: ModalState;
  openModal: (m: Exclude<ModalState, null>) => void;
  openProject: (slug: string) => void;
  closeModal: () => void;
  toast: (t: Omit<Toast, "id">) => number;
  updateToast: (id: number, t: Partial<Omit<Toast, "id">>) => void;
  projects: Project[];
  contrast: "normal" | "high";
  toggleContrast: () => void;
}

const Ctx = createContext<UICtx | null>(null);

export function useUI() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}

function readModalFromUrl(): ModalState {
  if (typeof window === "undefined") return null;
  const sp = new URLSearchParams(window.location.search);
  const slug = sp.get("project");
  if (slug && PROJECTS.some((p) => p.slug === slug)) return { type: "project", slug };
  const m = sp.get("modal");
  if (m && (SIMPLE_MODALS as readonly string[]).includes(m)) return { type: m } as ModalState;
  return null;
}

function writeModalToUrl(m: ModalState, push: boolean) {
  const url = new URL(window.location.href);
  url.searchParams.delete("project");
  url.searchParams.delete("modal");
  if (m?.type === "project") url.searchParams.set("project", m.slug);
  else if (m && m.type !== "search") url.searchParams.set("modal", m.type);
  const next = url.pathname + url.search + url.hash;
  if (next === window.location.pathname + window.location.search + window.location.hash) return;
  if (push) window.history.pushState({ __modal: true }, "", next);
  else window.history.replaceState(window.history.state, "", next);
}

export function UIProvider({ children, initialProjects }: { children: ReactNode; initialProjects?: Project[] }) {
  const [modal, setModal] = useState<ModalState>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [projects, setProjects] = useState<Project[]>(initialProjects ?? PROJECTS);
  const [contrast, setContrast] = useState<"normal" | "high">("normal");
  const idRef = useRef(0);
  const { stop, start } = useSmoothScroll();

  // Hydrate from the unified API (keeps client in sync with server data source)
  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/projects", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { projects?: Project[] } | null) => {
        if (data?.projects?.length) setProjects(data.projects);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  // Deep links + back button
  useEffect(() => {
    setModal(readModalFromUrl());
    const onPop = () => setModal(readModalFromUrl());
    window.addEventListener("popstate", onPop);
    const saved = localStorage.getItem("as-contrast");
    if (saved === "high") setContrast("high");
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.contrast = contrast;
    localStorage.setItem("as-contrast", contrast);
  }, [contrast]);

  // Lock scroll while a modal is open
  useEffect(() => {
    if (!modal) return;
    stop();
    document.body.style.overflow = "hidden";
    return () => {
      start();
      document.body.style.overflow = "";
    };
  }, [modal, stop, start]);

  const openModal = useCallback((m: Exclude<ModalState, null>) => {
    setModal(m);
    writeModalToUrl(m, true);
  }, []);
  const openProject = useCallback((slug: string) => openModal({ type: "project", slug }), [openModal]);
  const closeModal = useCallback(() => {
    setModal(null);
    writeModalToUrl(null, false);
  }, []);

  // Global keyboard: ⌘K / Ctrl+K opens search, Esc closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openModal({ type: "search" });
      } else if (e.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openModal, closeModal]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const schedule = useCallback(
    (id: number, kind: ToastKind) => {
      if (kind !== "loading") window.setTimeout(() => dismiss(id), kind === "error" ? 6000 : 4200);
    },
    [dismiss],
  );
  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-3), { ...t, id }]);
      schedule(id, t.kind);
      return id;
    },
    [schedule],
  );
  const updateToast = useCallback(
    (id: number, t: Partial<Omit<Toast, "id">>) => {
      setToasts((prev) => prev.map((x) => (x.id === id ? { ...x, ...t } : x)));
      if (t.kind) schedule(id, t.kind);
    },
    [schedule],
  );

  const toggleContrast = useCallback(() => setContrast((c) => (c === "high" ? "normal" : "high")), []);

  const value = useMemo(
    () => ({ modal, openModal, openProject, closeModal, toast, updateToast, projects, contrast, toggleContrast }),
    [modal, openModal, openProject, closeModal, toast, updateToast, projects, contrast, toggleContrast],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex w-[min(92vw,380px)] flex-col gap-3" aria-live="polite">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="glass glass-dark pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3 text-white"
              role="status"
            >
              <span className="mt-1.5 flex h-2.5 w-2.5 shrink-0 items-center justify-center">
                {t.kind === "loading" ? (
                  <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      t.kind === "success" ? "bg-emerald-400" : t.kind === "error" ? "bg-rose-500" : "bg-sky-400"
                    }`}
                  />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{t.title}</p>
                {t.description && <p className="mt-0.5 text-xs text-white/60">{t.description}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="text-white/40 hover:text-white" aria-label="Dismiss notification">
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
