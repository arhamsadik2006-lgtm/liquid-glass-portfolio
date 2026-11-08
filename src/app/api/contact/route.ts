import { NextResponse, type NextRequest } from "next/server";
import { createInquiry } from "@/lib/inquiry-service";
import { clientIp, rateLimit } from "@/lib/server-utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`contact:${ip}`, 5, 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many requests — please wait a minute." }, { status: 429 });
  }

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > 20_000) {
    return NextResponse.json({ ok: false, error: "Payload too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await createInquiry(body, ip);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, fieldErrors: result.fieldErrors },
      { status: result.status },
    );
  }
  return NextResponse.json(
    { ok: true, id: result.id, emailSent: result.emailSent, message: result.message },
    { status: 201 },
  );
}

export function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed. Use POST." }, { status: 405 });
}
