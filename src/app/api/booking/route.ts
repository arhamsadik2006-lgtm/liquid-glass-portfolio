import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { bookingSchema, flattenErrors } from "@/lib/validation";
import { clientIp, notify, rateLimit } from "@/lib/server-utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`booking:${ip}`, 4, 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many requests — please wait a minute." }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", fieldErrors: flattenErrors(parsed.error) },
      { status: 422 },
    );
  }
  const d = parsed.data;
  try {
    const [row] = await db
      .insert(bookings)
      .values({
        name: d.name,
        email: d.email,
        preferredDate: d.preferredDate,
        slot: d.slot,
        projectType: d.projectType,
        notes: d.notes ?? null,
      })
      .returning({ id: bookings.id });
    await notify(`New discovery call — ${d.preferredDate} @ ${d.slot}`, {
      name: d.name,
      email: d.email,
      date: d.preferredDate,
      slot: d.slot,
      type: d.projectType,
      notes: d.notes,
    });
    return NextResponse.json(
      { ok: true, id: row.id, message: `Call requested for ${d.preferredDate} at ${d.slot}. Confirmation incoming.` },
      { status: 201 },
    );
  } catch (err) {
    console.error("[booking] failed", err);
    return NextResponse.json({ ok: false, error: "Could not save booking. Please try again." }, { status: 500 });
  }
}
