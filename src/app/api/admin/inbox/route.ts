// src/app/api/admin/inbox/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, inquiries } from "@/db/schema";

export const dynamic = "force-dynamic";

function checkAuth(req: NextRequest): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  const provided = req.headers.get("x-admin-password") || "";
  return provided === expected;
}

/** GET all client inquiries and discovery call bookings */
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const [inquiryRows, bookingRows] = await Promise.all([
      db.select().from(inquiries).orderBy(desc(inquiries.createdAt)),
      db.select().from(bookings).orderBy(desc(bookings.createdAt)),
    ]);
    return NextResponse.json({
      ok: true,
      inquiries: inquiryRows,
      bookings: bookingRows,
    });
  } catch (err) {
    console.error("[admin inbox GET]", err);
    return NextResponse.json({ ok: false, error: "Failed to load inbox" }, { status: 500 });
  }
}

/** DELETE an inquiry or booking */
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const type = req.nextUrl.searchParams.get("type");
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id || (type !== "inquiry" && type !== "booking")) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  try {
    if (type === "inquiry") {
      await db.delete(inquiries).where(eq(inquiries.id, id));
    } else {
      await db.delete(bookings).where(eq(bookings.id, id));
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin inbox DELETE]", err);
    return NextResponse.json({ ok: false, error: "Failed to delete item" }, { status: 500 });
  }
}