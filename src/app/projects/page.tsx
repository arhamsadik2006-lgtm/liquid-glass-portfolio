import type { Metadata } from "next";
import { ProjectsGrid } from "@/components/projects/ProjectsGrid";
import { getCategory } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Commercials, motion graphics, explainers, VFX and documentary edits by Arham Sadik.",
};

export default async function ProjectsPage({ searchParams }: PageProps<"/projects">) {
  const sp = await searchParams;
  const rawCat = typeof sp.category === "string" ? sp.category : "all";
  const category = getCategory(rawCat) ? rawCat : "all";
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const cat = getCategory(category);

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-24 pt-32 sm:px-8">
      <div className="grid-canvas grid-fade pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-40 left-1/3 h-[500px] w-[700px] rounded-full bg-violet-600/15 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/45">Portfolio / {cat ? cat.title : "All"}</p>
        <h1 className="font-display mt-3 text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-[0.95] tracking-tight">
          {cat ? cat.title : "Every edit."}
          <span className="block text-white/35">{cat ? cat.subtitle : "Filtered your way."}</span>
        </h1>
        <ProjectsGrid category={category} q={q} />
      </div>
    </main>
  );
}
