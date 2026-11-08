import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory, getProject, PROJECTS } from "@/lib/projects";
import { CaseStudyActions } from "@/components/projects/CaseStudyActions";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return { title: "Project not found" };
  return { title: p.title, description: p.summary, openGraph: { images: [p.thumbnail] } };
}

export default async function CaseStudyPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const cat = getCategory(p.category);
  const idx = PROJECTS.findIndex((x) => x.slug === p.slug);
  const next = PROJECTS[(idx + 1) % PROJECTS.length];
  const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-24 pt-32 sm:px-8">
      <div className="grid-canvas grid-fade pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full blur-[150px]" style={{ background: `${p.accent}33` }} />
      <article className="relative mx-auto max-w-6xl">
        <nav className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/45" aria-label="Breadcrumb">
          <Link href="/projects" className="hover:text-white">Projects</Link> /{" "}
          <Link href={`/projects?category=${p.category}`} className="hover:text-white">{cat?.title}</Link> / #{String(p.index).padStart(2, "0")}
        </nav>
        <h1 className="font-display mt-4 text-[clamp(2.2rem,5.5vw,4.6rem)] font-semibold leading-[0.95] tracking-tight">{p.title}</h1>
        <p className="mt-3 text-white/55">
          {p.client} · {p.year} · {p.runtime} · {p.aspectRatio}
        </p>

        <div className="glass mt-8 overflow-hidden rounded-[28px] p-2">
          <div className="relative aspect-video overflow-hidden rounded-[22px] bg-black">
            <video src={p.videoUrl} poster={p.thumbnail} controls playsInline preload="metadata" className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/45">Overview</h2>
            <p className="mt-3 text-lg leading-relaxed text-white/80">{p.summary}</p>
            <h2 className="mt-10 font-mono text-[11px] uppercase tracking-[0.25em] text-white/45">Process breakdown</h2>
            <ol className="mt-4 space-y-4">
              {p.breakdown.map((b, i) => (
                <li key={i} className="glass flex gap-4 rounded-2xl p-4 text-white/75">
                  <span className="font-mono text-sm text-white/35">{String(i + 1).padStart(2, "0")}</span>
                  {b}
                </li>
              ))}
            </ol>
          </div>
          <aside className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {p.results.map((r) => (
                <div key={r.label} className="glass rounded-2xl p-4 text-center">
                  <p className="font-display text-2xl font-semibold">{r.value}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/45">{r.label}</p>
                </div>
              ))}
            </div>
            <div className="glass rounded-2xl p-5">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/45">Tools</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.tools.map((t) => (
                  <span key={t} className="glass rounded-full px-3 py-1 text-xs">{t}</span>
                ))}
              </div>
            </div>
            <figure className="glass rounded-2xl p-5">
              <blockquote className="text-white/80">“{p.testimonial.quote}”</blockquote>
              <figcaption className="mt-3 text-sm text-white/45">{p.testimonial.author} — {p.testimonial.role}</figcaption>
            </figure>
            <CaseStudyActions />
          </aside>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2">
          {[prev, next].map((x, i) => (
            <Link key={x.slug} href={`/projects/${x.slug}`} className="glass glass-liquid group flex items-center gap-4 rounded-3xl p-3">
              <span className="relative h-20 w-32 shrink-0 overflow-hidden rounded-2xl">
                <Image src={x.thumbnail} alt={x.title} fill sizes="128px" className="object-cover transition group-hover:scale-110" />
              </span>
              <span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">{i === 0 ? "← Previous" : "Next →"}</span>
                <span className="mt-1 block font-semibold">{x.title}</span>
              </span>
            </Link>
          ))}
        </div>
      </article>
    </main>
  );
}
