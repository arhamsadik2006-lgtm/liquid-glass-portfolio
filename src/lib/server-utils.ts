import { Resend } from "resend";

/* ---------------- Rate limiting (in-memory sliding window) ---------------- */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) buckets.clear();
  return true;
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "local";
}

/** Lightweight deterministic hash that doesn't require Node native crypto types */
export function hashIp(ip: string): string {
  const salt = (typeof process !== "undefined" && process.env?.IP_SALT) || "arham-sadik";
  const str = `${ip}:${salt}`;
  let h1 = 0xdeadbeef ^ str.length;
  let h2 = 0x41c6ce57 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
}

/* ---------------- Email notifications (Resend, optional) ---------------- */
const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function notify(subject: string, fields: Record<string, string | undefined | null>) {
  const env = typeof process !== "undefined" ? process.env : ({} as Record<string, string | undefined>);
  const key = env.RESEND_API_KEY;
  const to = env.NOTIFY_EMAIL ?? "hello@arhamsadik.com";
  const from = env.RESEND_FROM ?? "Portfolio <onboarding@resend.dev>";

  const rows = Object.entries(fields)
    .filter(([, v]) => Boolean(v))
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:#888;font:12px monospace;text-transform:uppercase">${escapeHtml(k)}</td><td style="padding:6px 12px;font:14px sans-serif;white-space:pre-wrap">${escapeHtml(String(v))}</td></tr>`,
    )
    .join("");

  if (!key) {
    console.info(`[notify] RESEND_API_KEY not set — skipping email: ${subject}`);
    return { sent: false as const };
  }

  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      html: `<h2 style="font-family:sans-serif">${escapeHtml(subject)}</h2><table>${rows}</table>`,
      replyTo: fields.email ?? undefined,
    });
    if (error) {
      console.error("[notify] Resend error", error);
      return { sent: false as const };
    }
    return { sent: true as const };
  } catch (err) {
    console.error("[notify] failed", err);
    return { sent: false as const };
  }
}