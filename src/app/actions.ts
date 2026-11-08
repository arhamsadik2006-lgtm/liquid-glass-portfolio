"use server";

import { headers } from "next/headers";
import { createInquiry, type InquiryResult } from "@/lib/inquiry-service";
import { clientIp, rateLimit } from "@/lib/server-utils";

/** Server Action powering the dock's quick-message drawer. */
export async function sendQuickMessage(input: {
  name: string;
  email: string;
  message: string;
  website?: string;
}): Promise<InquiryResult> {
  const h = await headers();
  const ip = clientIp(h);
  if (!rateLimit(`quick:${ip}`, 5, 60_000)) {
    return { ok: false, status: 429, error: "Too many messages — please wait a minute." };
  }
  return createInquiry(
    {
      ...input,
      serviceType: "Commercial Edit",
      budget: "$1k – $3k",
      timeline: "Flexible",
      source: "quick-drawer",
    },
    ip,
  );
}
