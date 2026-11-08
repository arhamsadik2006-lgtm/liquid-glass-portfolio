import { NextResponse } from "next/server";
import { getProject, PROJECTS } from "@/lib/projects";

export async function GET(_req: Request, ctx: RouteContext<"/api/projects/[slug]">) {
  const { slug } = await ctx.params;
  const project = getProject(slug);
  if (!project) return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  const related = PROJECTS.filter((p) => p.category === project.category && p.slug !== slug).slice(0, 3);
  return NextResponse.json({ ok: true, project, related });
}
