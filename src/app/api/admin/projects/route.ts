// src/app/api/admin/projects/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { customProjects } from "@/db/schema";
import type { AspectRatio, CategoryId, DockGroup, Tool } from "@/lib/projects";

export const dynamic = "force-dynamic";

function checkAuth(req: NextRequest): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  const provided = req.headers.get("x-admin-password") || "";
  return provided === expected;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** GET all database projects for the admin list */
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ ok: false, error: "Invalid admin password" }, { status: 401 });
  }
  try {
    const rows = await db.select().from(customProjects).orderBy(desc(customProjects.createdAt));
    return NextResponse.json({ ok: true, projects: rows });
  } catch (err) {
    console.error("[admin GET]", err);
    return NextResponse.json({ ok: false, error: "Database query failed" }, { status: 500 });
  }
}

/** POST a new project (supports file uploads or direct paths) */
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized: Incorrect Admin Password" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const title = String(formData.get("title") || "").trim();
    const client = String(formData.get("client") || "").trim();
    const category = String(formData.get("category") || "motion-graphics") as CategoryId;
    const label = String(formData.get("label") || category.toUpperCase()).trim().toUpperCase();
    const runtime = String(formData.get("runtime") || "1:00").trim();
    const year = Number(formData.get("year") || new Date().getFullYear());
    const aspectRatio = String(formData.get("aspectRatio") || "16:9") as AspectRatio;
    const accent = String(formData.get("accent") || "#a855f7").trim();
    const summary = String(formData.get("summary") || "").trim();
    const views = Number(formData.get("views") || 100000);
    const featured = formData.get("featured") === "true";

    const toolsRaw = String(formData.get("tools") || "After Effects");
    const tools = toolsRaw.split(",").map((t) => t.trim()).filter(Boolean) as Tool[];

    const dockRaw = String(formData.get("dock") || "ae");
    const dock = dockRaw.split(",").map((d) => d.trim()).filter(Boolean) as DockGroup[];

    if (!title || !client || !summary) {
      return NextResponse.json({ ok: false, error: "Title, Client, and Summary are required." }, { status: 400 });
    }

    const baseSlug = slugify(String(formData.get("slug") || title)) || `project-${Date.now()}`;
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    // 1. Handle Thumbnail File Upload or URL
    let thumbnailPath = String(formData.get("thumbnailUrl") || "").trim();
    const thumbFile = formData.get("thumbnailFile");
    if (thumbFile instanceof File && thumbFile.size > 0) {
      const ext = path.extname(thumbFile.name) || ".jpg";
      const fileName = `${slug}${ext}`;
      const imagesDir = path.join(process.cwd(), "public", "images");
      await mkdir(imagesDir, { recursive: true });
      const buffer = Buffer.from(await thumbFile.arrayBuffer());
      await writeFile(path.join(imagesDir, fileName), buffer);
      thumbnailPath = `/images/${fileName}`;
    }

    // 2. Handle Video File Upload or URL
    let videoPath = String(formData.get("videoUrl") || "").trim();
    const videoFile = formData.get("videoFile");
    if (videoFile instanceof File && videoFile.size > 0) {
      const ext = path.extname(videoFile.name) || ".mp4";
      const fileName = `${slug}${ext}`;
      const videosDir = path.join(process.cwd(), "public", "videos");
      await mkdir(videosDir, { recursive: true });
      const buffer = Buffer.from(await videoFile.arrayBuffer());
      await writeFile(path.join(videosDir, fileName), buffer);
      videoPath = `/videos/${fileName}`;
    }

    if (!thumbnailPath || !videoPath) {
      return NextResponse.json(
        { ok: false, error: "Please upload both a thumbnail image and a video file (or provide their paths)." },
        { status: 400 },
      );
    }

    const [inserted] = await db
      .insert(customProjects)
      .values({
        slug,
        title,
        client,
        category,
        label,
        runtime,
        year,
        thumbnail: thumbnailPath,
        videoUrl: videoPath,
        aspectRatio,
        tools,
        dock,
        accent,
        summary,
        views,
        featured,
      })
      .returning();

    return NextResponse.json({ ok: true, project: inserted }, { status: 201 });
  } catch (err) {
    console.error("[admin POST]", err);
    return NextResponse.json({ ok: false, error: "Failed to save project." }, { status: 500 });
  }
}

/** DELETE a custom project by ID */
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing project ID" }, { status: 400 });
  }
  try {
    await db.delete(customProjects).where(eq(customProjects.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin DELETE]", err);
    return NextResponse.json({ ok: false, error: "Failed to delete project" }, { status: 500 });
  }
}