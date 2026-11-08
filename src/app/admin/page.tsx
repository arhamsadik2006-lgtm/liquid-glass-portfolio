// src/app/admin/page.tsx
"use client";

import React, { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ALL_CATEGORIES, type AspectRatio, type CategoryId, type DockGroup, type Tool } from "@/lib/projects";
import { TOOLS_STACK } from "@/lib/content";

interface SavedProject {
  id: number;
  slug: string;
  title: string;
  client: string;
  category: CategoryId;
  label: string;
  runtime: string;
  aspectRatio: AspectRatio;
  thumbnail: string;
  videoUrl: string;
}

interface InquiryItem {
  id: number;
  name: string;
  email: string;
  company: string | null;
  serviceType: string;
  budget: string;
  timeline: string;
  message: string;
  createdAt: string;
}

interface BookingItem {
  id: number;
  name: string;
  email: string;
  preferredDate: string;
  slot: string;
  projectType: string;
  notes: string | null;
  createdAt: string;
}

const ASPECT_RATIOS: AspectRatio[] = ["16:9", "9:16", "1:1", "4:5"];
const DOCK_OPTIONS: { id: DockGroup; name: string }[] = [
  { id: "ae", name: "After Effects (Ae)" },
  { id: "ps", name: "Photoshop (Ps)" },
  { id: "ai", name: "Illustrator (Ai)" },
];

const inputCls =
  "glass focus-ring w-full rounded-2xl bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<"inbox" | "projects">("inbox");

  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Project Form state
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [category, setCategory] = useState<CategoryId>("motion-graphics");
  const [label, setLabel] = useState("");
  const [runtime, setRuntime] = useState("1:00");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [accent, setAccent] = useState("#a855f7");
  const [views, setViews] = useState("150000");
  const [summary, setSummary] = useState("");
  const [tools, setTools] = useState<Tool[]>(["After Effects", "Premiere Pro"]);
  const [dock, setDock] = useState<DockGroup[]>(["ae"]);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const loadAllData = async (pw: string) => {
    setAuthError("");
    const [projRes, inboxRes] = await Promise.all([
      fetch("/api/admin/projects", { headers: { "x-admin-password": pw } }),
      fetch("/api/admin/inbox", { headers: { "x-admin-password": pw } }),
    ]);

    const projData = await projRes.json();
    if (!projRes.ok || !projData.ok) {
      setAuthError(projData.error || "Invalid password");
      setUnlocked(false);
      return;
    }

    const inboxData = await inboxRes.json();
    setUnlocked(true);
    setProjects(projData.projects || []);
    if (inboxData.ok) {
      setInquiries(inboxData.inquiries || []);
      setBookings(inboxData.bookings || []);
    }
    sessionStorage.setItem("as-admin-pw", pw);
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("as-admin-pw");
    if (saved) {
      setPassword(saved);
      loadAllData(saved);
    }
  }, []);

  const toggleTool = (t: Tool) => {
    setTools((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const toggleDock = (d: DockGroup) => {
    setDock((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  const handlePublish = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);

    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("client", client);
      fd.append("category", category);
      fd.append("label", label || category.toUpperCase());
      fd.append("runtime", runtime);
      fd.append("aspectRatio", aspectRatio);
      fd.append("accent", accent);
      fd.append("views", views);
      fd.append("summary", summary);
      fd.append("tools", tools.join(","));
      fd.append("dock", dock.join(","));
      fd.append("featured", "true");
      if (thumbFile) fd.append("thumbnailFile", thumbFile);
      if (videoFile) fd.append("videoFile", videoFile);

      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatusMsg({ type: "err", text: data.error || "Upload failed" });
      } else {
        setStatusMsg({ type: "ok", text: `Published "${data.project.title}"! It is now live on your portfolio.` });
        setTitle("");
        setClient("");
        setLabel("");
        setSummary("");
        setThumbFile(null);
        setVideoFile(null);
        await loadAllData(password);
      }
    } catch {
      setStatusMsg({ type: "err", text: "Network error while uploading project." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: number, name: string) => {
    if (!window.confirm(`Delete "${name}" from your portfolio?`)) return;
    const res = await fetch(`/api/admin/projects?id=${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleDeleteInboxItem = async (type: "inquiry" | "booking", id: number) => {
    if (!window.confirm("Delete this entry from your inbox?")) return;
    const res = await fetch(`/api/admin/inbox?type=${type}&id=${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      if (type === "inquiry") setInquiries((prev) => prev.filter((x) => x.id !== id));
      else setBookings((prev) => prev.filter((x) => x.id !== id));
    }
  };

  if (!unlocked) {
    return (
      <main className="relative grid min-h-screen place-items-center px-4">
        <div className="grid-canvas grid-fade pointer-events-none absolute inset-0" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadAllData(password);
          }}
          className="glass glass-dark relative w-full max-w-md space-y-5 rounded-[32px] p-8"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/45">Arham Sadik · Studio</p>
          <h1 className="font-display text-3xl font-semibold">Admin Access</h1>
          <input
            type="password"
            placeholder="Enter ADMIN_PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
          {authError && <p className="text-xs text-rose-400">{authError}</p>}
          <button type="submit" className="w-full rounded-full bg-white py-3.5 text-sm font-semibold text-black">
            Unlock Studio Dashboard
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen px-4 pb-24 pt-28 sm:px-8">
      <div className="grid-canvas grid-fade pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-6xl space-y-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400">● Live Studio CMS</p>
            <h1 className="font-display mt-1 text-4xl font-semibold">Portfolio Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadAllData(password)}
              className="glass rounded-full px-4 py-2.5 text-xs text-white/75 hover:text-white"
            >
              ↻ Refresh
            </button>
            <Link href="/" className="glass rounded-full px-5 py-2.5 text-sm">
              ← Back to Live Website
            </Link>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("inbox")}
            className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
              activeTab === "inbox" ? "bg-white text-black" : "glass text-white/70 hover:text-white"
            }`}
          >
            Client Inbox ({inquiries.length + bookings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
              activeTab === "projects" ? "bg-white text-black" : "glass text-white/70 hover:text-white"
            }`}
          >
            Manage Projects ({projects.length})
          </button>
        </div>

        {/* TAB 1: CLIENT INBOX & BOOKINGS */}
        {activeTab === "inbox" && (
          <div className="space-y-10">
            {/* Project Briefs */}
            <section className="space-y-4">
              <h2 className="font-display text-2xl font-semibold">
                Project Briefs ({inquiries.length})
              </h2>
              {inquiries.length === 0 ? (
                <p className="glass rounded-3xl p-8 text-center text-sm text-white/50">
                  No project briefs submitted yet. Try sending a test message from the Contact Terminal on your homepage!
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="glass glass-dark flex flex-col justify-between rounded-3xl p-6 space-y-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="rounded-full bg-emerald-500/20 px-3 py-1 font-mono text-[11px] text-emerald-300">
                            {inq.serviceType}
                          </span>
                          <span className="font-mono text-xs text-white/45">
                            {new Date(inq.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {inq.name} {inq.company ? <span className="text-sm font-normal text-white/50">· {inq.company}</span> : null}
                          </h3>
                          <a href={`mailto:${inq.email}`} className="text-xs text-cyan-300 hover:underline">
                            {inq.email}
                          </a>
                        </div>

                        <div className="flex flex-wrap gap-2 font-mono text-xs">
                          <span className="glass rounded-full px-3 py-1 text-white/80">💰 Budget: {inq.budget}</span>
                          <span className="glass rounded-full px-3 py-1 text-white/80">⏱ Timeline: {inq.timeline}</span>
                        </div>

                        <p className="rounded-2xl bg-white/5 p-4 text-sm leading-relaxed text-white/85 whitespace-pre-wrap">
                          {inq.message}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <a
                          href={`mailto:${inq.email}?subject=Re: ${ encodeURIComponent(inq.serviceType) } Inquiry — Arham Sadik`}
                          className="flex-1 rounded-full bg-white py-2.5 text-center text-xs font-semibold text-black"
                        >
                          Reply via Email ↗
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteInboxItem("inquiry", inq.id)}
                          className="rounded-full bg-rose-500/20 px-4 py-2.5 text-xs font-medium text-rose-300 hover:bg-rose-500/35"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Discovery Call Bookings */}
            <section className="space-y-4">
              <h2 className="font-display text-2xl font-semibold">
                Discovery Call Bookings ({bookings.length})
              </h2>
              {bookings.length === 0 ? (
                <p className="glass rounded-3xl p-8 text-center text-sm text-white/50">
                  No discovery calls booked yet.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {bookings.map((b) => (
                    <div key={b.id} className="glass glass-dark flex flex-col justify-between rounded-3xl p-6 space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-purple-500/20 px-3 py-1 font-mono text-[11px] text-purple-300">
                            📅 {b.preferredDate} · {b.slot}
                          </span>
                          <span className="font-mono text-xs text-white/45">
                            {new Date(b.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-white">{b.name}</h3>
                          <a href={`mailto:${b.email}`} className="text-xs text-cyan-300 hover:underline">
                            {b.email}
                          </a>
                        </div>

                        <p className="font-mono text-xs text-white/70">Project Type: {b.projectType}</p>
                        {b.notes && (
                          <p className="rounded-2xl bg-white/5 p-3.5 text-sm text-white/80 whitespace-pre-wrap">
                            {b.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <a
                          href={`mailto:${b.email}?subject=Discovery Call Confirmation (${encodeURIComponent(b.preferredDate)}) — Arham Sadik`}
                          className="flex-1 rounded-full bg-white py-2.5 text-center text-xs font-semibold text-black"
                        >
                          Confirm Call via Email ↗
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteInboxItem("booking", b.id)}
                          className="rounded-full bg-rose-500/20 px-4 py-2.5 text-xs font-medium text-rose-300 hover:bg-rose-500/35"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: UPLOAD & MANAGE PROJECTS */}
        {activeTab === "projects" && (
          <div className="space-y-12">
            <form onSubmit={handlePublish} className="glass glass-dark space-y-6 rounded-[32px] p-6 sm:p-10">
              <h2 className="font-display text-2xl font-semibold">Add New Project</h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-white/50">Project Title *</span>
                  <input required className={inputCls} placeholder="e.g., SaaS Launch Reel" value={title} onChange={(e) => setTitle(e.target.value)} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-white/50">Client Name *</span>
                  <input required className={inputCls} placeholder="e.g., GigaDigital" value={client} onChange={(e) => setClient(e.target.value)} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-white/50">Desktop Label (Uppercase)</span>
                  <input className={inputCls} placeholder="e.g., SAAS EXPLAINER" value={label} onChange={(e) => setLabel(e.target.value)} />
                </label>

                <label className="block">
                  <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-white/50">Category</span>
                  <select className={`${inputCls} bg-[#12141c]`} value={category} onChange={(e) => setCategory(e.target.value as CategoryId)}>
                    {ALL_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-white/50">Aspect Ratio</span>
                  <select className={`${inputCls} bg-[#12141c]`} value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}>
                    {ASPECT_RATIOS.map((ar) => (
                      <option key={ar} value={ar}>
                        {ar} {ar === "16:9" ? "(Widescreen)" : ar === "9:16" ? "(Vertical Reel)" : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <label className="block">
                    <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-white/50">Runtime</span>
                    <input className={inputCls} placeholder="1:15" value={runtime} onChange={(e) => setRuntime(e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-white/50">Views</span>
                    <input type="number" className={inputCls} value={views} onChange={(e) => setViews(e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-white/50">Accent</span>
                    <input type="color" className="h-[46px] w-full cursor-pointer rounded-2xl bg-transparent" value={accent} onChange={(e) => setAccent(e.target.value)} />
                  </label>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="glass block cursor-pointer rounded-2xl p-4 hover:bg-white/5">
                  <span className="block font-mono text-[11px] uppercase tracking-wider text-emerald-300">1. Upload Thumbnail (.jpg / .png) *</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
                    className="mt-2 block w-full text-xs text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black"
                  />
                </label>

                <label className="glass block cursor-pointer rounded-2xl p-4 hover:bg-white/5">
                  <span className="block font-mono text-[11px] uppercase tracking-wider text-cyan-300">2. Upload Video (.mp4 / .mov) *</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="mt-2 block w-full text-xs text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black"
                  />
                </label>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <span className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-white/50">Tools Used</span>
                  <div className="flex flex-wrap gap-2">
                    {(TOOLS_STACK as Tool[]).map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => toggleTool(t)}
                        className={`rounded-full px-3 py-1.5 text-xs transition ${
                          tools.includes(t) ? "bg-white font-semibold text-black" : "glass text-white/65"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-white/50">Creator Desktop Dock Filter</span>
                  <div className="flex flex-wrap gap-2">
                    {DOCK_OPTIONS.map((d) => (
                      <button
                        type="button"
                        key={d.id}
                        onClick={() => toggleDock(d.id)}
                        className={`rounded-full px-3 py-1.5 text-xs transition ${
                          dock.includes(d.id) ? "bg-white font-semibold text-black" : "glass text-white/65"
                        }`}
                      >
                        {d.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <label className="block">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-white/50">Project Summary *</span>
                <textarea
                  required
                  rows={3}
                  className={inputCls}
                  placeholder="Describe the edit, pacing, and visual effects..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </label>

              {statusMsg && (
                <p className={`rounded-2xl px-4 py-3 text-sm ${statusMsg.type === "ok" ? "bg-emerald-500/20 text-emerald-200" : "bg-rose-500/20 text-rose-200"}`}>
                  {statusMsg.text}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-white py-4 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:opacity-50"
              >
                {submitting ? "Uploading & Saving to Database..." : "+ Publish Project to Portfolio"}
              </button>
            </form>

            <section className="space-y-4">
              <h2 className="font-display text-2xl font-semibold">Database Projects ({projects.length})</h2>
              {projects.length === 0 ? (
                <p className="glass rounded-3xl p-8 text-center text-sm text-white/50">
                  No projects uploaded through the Admin panel yet. Your starter projects in <code>projects.ts</code> are still active.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {projects.map((p) => (
                    <div key={p.id} className="glass flex flex-col justify-between rounded-3xl p-4">
                      <div>
                        <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
                          <Image src={p.thumbnail} alt={p.title} fill sizes="320px" className="object-cover" />
                        </div>
                        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-white/45">
                          {p.category} · {p.aspectRatio} · {p.runtime}
                        </p>
                        <h3 className="mt-1 font-semibold">{p.title}</h3>
                        <p className="text-xs text-white/50">{p.client}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(p.id, p.title)}
                        className="mt-4 w-full rounded-full bg-rose-500/20 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/35"
                      >
                        Delete Project
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}