"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import { AnimatePresence } from "framer-motion";
import { GlassModal } from "@/components/ui/GlassModal";
import { useUI, type ModalState } from "@/components/providers/UIProvider";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { ALL_CATEGORIES, queryProjects } from "@/lib/projects";
import { BOOKING_SLOTS, SERVICE_TYPES, bookingSchema, flattenErrors } from "@/lib/validation";
import { sendQuickMessage } from "@/app/actions";
import { SearchIcon } from "@/components/ui/Icons";
import { ProjectModal, ShowreelModal, NotesWindow, GalleryModal, TrashModal } from "./ContentModals";

const field =
  "glass focus-ring w-full rounded-xl bg-transparent px-3.5 py-3 text-sm text-white placeholder:text-white/30 outline-none";

export function CommandPalette({ initialQuery = "", initialCategory = "all" }: { initialQuery?: string; initialCategory?: string }) {
  const { closeModal, openProject, projects } = useUI();
  const [q, setQ] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => queryProjects({ q, category }, projects), [q, category, projects]);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => setCursor(0), [q, category]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(results.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "Enter" && results[cursor]) {
      openProject(results[cursor].slug);
    }
  };

  return (
    <GlassModal onClose={closeModal} label="Search projects" className="mt-[8vh] max-w-2xl self-start">
      <div onKeyDown={onKey}>
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 pr-16">
          <SearchIcon width={18} height={18} className="text-white/50" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Edits, VFX, Reels, clients, tools…"
            className="w-full bg-transparent text-base text-white placeholder:text-white/35 outline-none"
            aria-label="Search query"
          />
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-3" role="tablist" aria-label="Filter by category">
          {[{ id: "all", title: "All" }, ...ALL_CATEGORIES].map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={category === c.id}
              onClick={() => setCategory(c.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition ${category === c.id ? "bg-white text-black" : "glass text-white/70 hover:text-white"}`}
            >
              {c.title}
            </button>
          ))}
        </div>
        <ul className="max-h-[52vh] overflow-y-auto px-2 pb-3" data-lenis-prevent>
          {results.length === 0 && <li className="px-4 py-10 text-center text-sm text-white/45">No edits match “{q}”. Try “VFX” or “reels”.</li>}
          {results.map((p, i) => (
            <li key={p.slug}>
              <button
                onMouseEnter={() => setCursor(i)}
                onClick={() => openProject(p.slug)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${i === cursor ? "bg-white/10" : ""}`}
              >
                <span className="relative h-10 w-16 shrink-0 overflow-hidden rounded-lg">
                  <Image src={p.thumbnail} alt="" fill sizes="64px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{p.title}</span>
                  <span className="block truncate text-xs text-white/45">{p.client} · {p.tools.join(", ")}</span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/35">{p.runtime}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-white/10 px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-white/35">
          <span>{results.length} results</span>
          <span>↑↓ navigate · ↵ open · esc close</span>
        </div>
      </div>
    </GlassModal>
  );
}

export function QuickMessageDrawer() {
  const { closeModal, toast, updateToast } = useUI();
  const { scrollTo } = useSmoothScroll();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const id = toast({ kind: "loading", title: "Sending message…" });
    startTransition(async () => {
      const res = await sendQuickMessage(form).catch(() => null);
      if (!res) {
        updateToast(id, { kind: "error", title: "Network error", description: "Please try again." });
        return;
      }
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        updateToast(id, { kind: "error", title: "Couldn't send", description: res.error });
        return;
      }
      updateToast(id, { kind: "success", title: "Message sent ✓", description: res.message });
      closeModal();
    });
  };

  return (
    <GlassModal onClose={closeModal} label="Quick message" position="right" className="h-full max-w-md">
      <form onSubmit={submit} className="flex h-full flex-col gap-4 p-6 pt-14" noValidate>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/45">Mail</p>
          <h3 className="font-display mt-1 text-2xl font-semibold">Quick message</h3>
          <p className="mt-1 text-sm text-white/50">Short note? Drop it here — it lands straight in Arham&apos;s inbox.</p>
        </div>
        <input className={field} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        {errors.name && <p className="-mt-2 text-xs text-rose-400">{errors.name}</p>}
        <input className={field} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {errors.email && <p className="-mt-2 text-xs text-rose-400">{errors.email}</p>}
        <textarea className={`${field} min-h-[160px]`} placeholder="What are we making?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        {errors.message && <p className="-mt-2 text-xs text-rose-400">{errors.message}</p>}
        <input tabIndex={-1} aria-hidden className="hidden" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        <button disabled={pending} className="rounded-full bg-white py-3 text-sm font-semibold text-black disabled:opacity-60">
          {pending ? "Sending…" : "Send message"}
        </button>
        <button
          type="button"
          onClick={() => {
            closeModal();
            window.setTimeout(() => scrollTo("#contact"), 80);
          }}
          className="glass rounded-full py-3 text-sm"
        >
          Open full project brief ↓
        </button>
      </form>
    </GlassModal>
  );
}

export function BookingModal() {
  const { closeModal, toast, updateToast } = useUI();
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const minDate = useMemo(() => new Date(Date.now() + 86_400_000).toISOString().slice(0, 10), []);
  const [form, setForm] = useState({ name: "", email: "", preferredDate: minDate, slot: "", projectType: "", notes: "" });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const local = bookingSchema.safeParse(form);
    if (!local.success) {
      setErrors(flattenErrors(local.error));
      return;
    }
    setSending(true);
    const id = toast({ kind: "loading", title: "Reserving your slot…" });
    try {
      const res = await fetch("/api/booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = (await res.json()) as { ok: boolean; message?: string; error?: string; fieldErrors?: Record<string, string> };
      if (!res.ok || !data.ok) {
        setErrors(data.fieldErrors ?? {});
        updateToast(id, { kind: "error", title: "Booking failed", description: data.error });
      } else {
        updateToast(id, { kind: "success", title: "Call requested ✓", description: data.message });
        closeModal();
      }
    } catch {
      updateToast(id, { kind: "error", title: "Network error", description: "Please try again." });
    } finally {
      setSending(false);
    }
  };

  const pill = (active: boolean) => `rounded-full px-3 py-1.5 text-xs transition ${active ? "bg-white text-black" : "glass text-white/70 hover:text-white"}`;

  return (
    <GlassModal onClose={closeModal} label="Quick book a discovery call" className="max-w-lg">
      <form onSubmit={submit} className="space-y-4 p-6 sm:p-7" noValidate>
        <div>
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-emerald-300/80">
            <span className="pulse-dot h-2 w-2 rounded-full bg-emerald-400" /> 2 slots left · Q4
          </p>
          <h3 className="font-display mt-2 text-2xl font-semibold">Book a discovery call</h3>
          <p className="mt-1 text-sm text-white/50">20 minutes. We&apos;ll scope your edit, timeline and budget.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <input className={field} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
          </div>
          <div>
            <input className={field} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
          </div>
        </div>
        <div>
          <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-white/45" htmlFor="bdate">Preferred date</label>
          <input id="bdate" type="date" min={minDate} className={`${field} [color-scheme:dark]`} value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} />
          {errors.preferredDate && <p className="mt-1 text-xs text-rose-400">{errors.preferredDate}</p>}
        </div>
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Time slot (GMT+5)</p>
          <div className="flex flex-wrap gap-2">
            {BOOKING_SLOTS.map((s) => (
              <button type="button" key={s} onClick={() => setForm({ ...form, slot: s })} className={pill(form.slot === s)}>{s}</button>
            ))}
          </div>
          {errors.slot && <p className="mt-1 text-xs text-rose-400">{errors.slot}</p>}
        </div>
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Project type</p>
          <div className="flex flex-wrap gap-2">
            {SERVICE_TYPES.map((s) => (
              <button type="button" key={s} onClick={() => setForm({ ...form, projectType: s })} className={pill(form.projectType === s)}>{s}</button>
            ))}
          </div>
          {errors.projectType && <p className="mt-1 text-xs text-rose-400">{errors.projectType}</p>}
        </div>
        <textarea className={`${field} min-h-[80px]`} placeholder="Anything I should know? (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button disabled={sending} className="w-full rounded-full bg-white py-3 text-sm font-semibold text-black disabled:opacity-60">
          {sending ? "Booking…" : "Request call"}
        </button>
      </form>
    </GlassModal>
  );
}

function renderModal(modal: Exclude<ModalState, null>) {
  switch (modal.type) {
    case "project":
      return <ProjectModal key={`p-${modal.slug}`} slug={modal.slug} />;
    case "search":
      return <CommandPalette key="search" initialQuery={modal.query} initialCategory={modal.category} />;
    case "showreel":
      return <ShowreelModal key="showreel" />;
    case "notes":
      return <NotesWindow key="notes" />;
    case "gallery":
      return <GalleryModal key="gallery" />;
    case "trash":
      return <TrashModal key="trash" />;
    case "quick-message":
      return <QuickMessageDrawer key="quick" />;
    case "booking":
      return <BookingModal key="booking" />;
  }
}

export function ModalRoot() {
  const { modal } = useUI();
  return <AnimatePresence mode="wait">{modal ? renderModal(modal) : null}</AnimatePresence>;
}
