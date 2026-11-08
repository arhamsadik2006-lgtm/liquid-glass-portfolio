"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "@/components/providers/UIProvider";
import { BUDGETS, SERVICE_TYPES, TIMELINES, contactSchema, flattenErrors, type ContactInput } from "@/lib/validation";
import { ArrowUpRight, CheckIcon } from "@/components/ui/Icons";

type FormState = {
  name: string;
  email: string;
  company: string;
  serviceType: string;
  budget: string;
  timeline: string;
  message: string;
  website: string;
};

const EMPTY: FormState = { name: "", email: "", company: "", serviceType: "", budget: "", timeline: "", message: "", website: "" };

function PillGroup({
  label,
  options,
  value,
  onChange,
  error,
  name,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
  name: string;
}) {
  return (
    <fieldset>
      <legend className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">{label}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const active = value === o;
          return (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={active}
              name={name}
              onClick={() => onChange(o)}
              className={`focus-ring relative rounded-full px-3.5 py-2 text-[13px] transition ${
                active ? "text-black" : "glass text-white/75 hover:text-white"
              }`}
            >
              {active && (
                <motion.span layoutId={`pill-${name}`} className="absolute inset-0 rounded-full bg-white" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
              )}
              <span className="relative">{o}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
    </fieldset>
  );
}

const inputCls =
  "glass focus-ring w-full rounded-2xl bg-transparent px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_0_0_1px_rgba(167,139,250,0.7)]";

export function ContactForm({ source = "contact-terminal" }: { source?: "contact-terminal" | "contact-page" }) {
  const { toast, updateToast } = useUI();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = { ...form, company: form.company || undefined, website: form.website || undefined, source } as ContactInput;
    const local = contactSchema.safeParse(payload);
    if (!local.success) {
      setErrors(flattenErrors(local.error));
      toast({ kind: "error", title: "Almost there", description: "Please complete the highlighted fields." });
      return;
    }
    setStatus("sending");
    const snapshot = form;
    // optimistic: clear the form + show progress immediately
    const id = toast({ kind: "loading", title: "Sending your brief…", description: `${form.serviceType} · ${form.budget}` });
    setForm(EMPTY);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; message?: string; error?: string; fieldErrors?: Record<string, string> };
      if (!res.ok || !data.ok) {
        setForm(snapshot); // rollback
        setErrors(data.fieldErrors ?? {});
        setStatus("idle");
        updateToast(id, { kind: "error", title: "Couldn't send", description: data.error ?? "Please try again." });
        return;
      }
      setStatus("sent");
      updateToast(id, { kind: "success", title: "Brief received ✓", description: data.message });
    } catch {
      setForm(snapshot);
      setStatus("idle");
      updateToast(id, { kind: "error", title: "Network error", description: "Check your connection and retry." });
    }
  };

  return (
    <AnimatePresence mode="wait">
      {status === "sent" ? (
        <motion.div
          key="sent"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex min-h-[420px] flex-col items-center justify-center text-center"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-400 text-black">
            <CheckIcon width={28} height={28} />
          </span>
          <h3 className="font-display mt-6 text-3xl font-semibold">Brief received.</h3>
          <p className="mt-2 max-w-sm text-sm text-white/55">Arham personally reviews every inquiry and replies within 24 hours with next steps.</p>
          <button onClick={() => setStatus("idle")} className="glass focus-ring mt-6 rounded-full px-5 py-2.5 text-sm">
            Send another
          </button>
        </motion.div>
      ) : (
        <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={submit} noValidate className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="sr-only">Name</span>
              <input className={inputCls} placeholder="Your name" value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" aria-invalid={!!errors.name} />
              {errors.name && <span className="mt-1.5 block text-xs text-rose-400">{errors.name}</span>}
            </label>
            <label className="block">
              <span className="sr-only">Email</span>
              <input className={inputCls} type="email" placeholder="you@company.com" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" aria-invalid={!!errors.email} />
              {errors.email && <span className="mt-1.5 block text-xs text-rose-400">{errors.email}</span>}
            </label>
          </div>
          <label className="block">
            <span className="sr-only">Company</span>
            <input className={inputCls} placeholder="Company / channel (optional)" value={form.company} onChange={(e) => set("company", e.target.value)} />
          </label>
          {/* honeypot */}
          <input tabIndex={-1} autoComplete="off" className="hidden" aria-hidden value={form.website} onChange={(e) => set("website", e.target.value)} name="website" />

          <PillGroup label="Service type" name="serviceType" options={SERVICE_TYPES} value={form.serviceType} onChange={(v) => set("serviceType", v)} error={errors.serviceType} />
          <PillGroup label="Estimated budget" name="budget" options={BUDGETS} value={form.budget} onChange={(v) => set("budget", v)} error={errors.budget} />
          <PillGroup label="Project timeline" name="timeline" options={TIMELINES} value={form.timeline} onChange={(v) => set("timeline", v)} error={errors.timeline} />

          <label className="block">
            <span className="mb-2.5 block font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Project scope</span>
            <textarea
              className={`${inputCls} min-h-[130px] resize-y`}
              placeholder="Tell me about the footage, the goal, the audience and where it'll live…"
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              aria-invalid={!!errors.message}
              maxLength={4000}
            />
            <span className="mt-1.5 flex justify-between text-xs">
              <span className="text-rose-400">{errors.message}</span>
              <span className="text-white/30">{form.message.length}/4000</span>
            </span>
          </label>

          <button
            type="submit"
            disabled={status === "sending"}
            className="focus-ring group flex w-full items-center justify-center gap-2 rounded-full bg-white py-4 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send Project Brief"}
            <ArrowUpRight width={16} height={16} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
