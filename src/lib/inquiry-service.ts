import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { contactSchema, flattenErrors } from "@/lib/validation";
import { hashIp, notify } from "@/lib/server-utils";

export type InquiryResult =
  | { ok: true; id: number; emailSent: boolean; message: string }
  | { ok: false; status: number; error: string; fieldErrors?: Record<string, string> };

/** Validate, sanitize, persist and notify — shared by POST /api/contact and the quick-message Server Action. */
export async function createInquiry(payload: unknown, ip: string): Promise<InquiryResult> {
  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, status: 422, error: "Validation failed", fieldErrors: flattenErrors(parsed.error) };
  }
  const data = parsed.data;
  try {
    const [row] = await db
      .insert(inquiries)
      .values({
        name: data.name,
        email: data.email,
        company: data.company ?? null,
        serviceType: data.serviceType,
        budget: data.budget,
        timeline: data.timeline,
        message: data.message,
        source: data.source,
        ipHash: hashIp(ip),
      })
      .returning({ id: inquiries.id });

    const mail = await notify(`New inquiry — ${data.serviceType} (${data.budget})`, {
      name: data.name,
      email: data.email,
      company: data.company,
      service: data.serviceType,
      budget: data.budget,
      timeline: data.timeline,
      source: data.source,
      message: data.message,
    });

    return {
      ok: true,
      id: row.id,
      emailSent: mail.sent,
      message: `Thanks ${data.name.split(" ")[0]} — your brief is in. Arham replies within 24 hours.`,
    };
  } catch (err) {
    console.error("[inquiry] persist failed", err);
    return { ok: false, status: 500, error: "Could not save your inquiry. Please try again or email directly." };
  }
}
