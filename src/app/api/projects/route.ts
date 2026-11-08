// src/app/api/projects/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { customProjects } from "@/db/schema";
import { ALL_CATEGORIES, PROFILE, PROJECTS, SHOWREEL, queryProjects, type Project } from "@/lib/projects";

export const dynamic = "force-dynamic";

function fmtViews(n: number) {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${Math.round(n / 1000)}K`;
}

export async function GET(req: NextRequest) {
  let dbList: Project[] = [];
  try {
    const rows = await db.select().from(customProjects).orderBy(asc(customProjects.createdAt));
    dbList = rows.map((r, idx) => ({
      slug: r.slug,
      index: PROJECTS.length + idx + 1,
      title: r.title,
      client: r.client,
      category: r.category,
      label: r.label,
      runtime: r.runtime,
      year: r.year,
      thumbnail: r.thumbnail,
      videoUrl: r.videoUrl,
      aspectRatio: r.aspectRatio,
      tools: r.tools ?? ["After Effects"],
      dock: r.dock ?? ["ae"],
      accent: r.accent,
      summary: r.summary,
      views: r.views,
      featured: r.featured,
      breakdown: [
        `Concept & hook strategy tailored for ${r.client}.`,
        `Timeline assembly and rhythm lock in ${(r.tools && r.tools[0]) || "After Effects"}.`,
        `Motion design, color grade, and 4K master delivery.`,
      ],
      results: [
        { label: "Views", value: fmtViews(r.views) },
        { label: "Retention", value: "78%+" },
        { label: "Delivery", value: "4K Master" },
      ],
      testimonial: {
        quote: "Smooth communication and sharp editing instincts from first cut to final master.",
        author: r.client,
        role: "Client",
      },
    }));
  } catch (err) {
    console.warn("[/api/projects] DB fetch skipped or table not pushed yet:", err);
  }

  const combined = [...PROJECTS, ...dbList];
  const sp = req.nextUrl.searchParams;
  const projects = queryProjects(
    {
      q: sp.get("q"),
      category: sp.get("category"),
      tool: sp.get("tool"),
      dock: sp.get("dock"),
      featured: sp.get("featured") === "true",
    },
    combined,
  );

  return NextResponse.json(
    {
      ok: true,
      count: projects.length,
      projects,
      categories: ALL_CATEGORIES,
      showreel: SHOWREEL,
      profile: PROFILE,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}