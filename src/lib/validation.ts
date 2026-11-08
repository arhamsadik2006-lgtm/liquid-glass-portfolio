import { z } from "zod";

export const SERVICE_TYPES = ["Commercial Edit", "Animated Explainer", "Motion Graphics / VFX", "Full Retainer"] as const;
export const BUDGETS = ["< $1k", "$1k – $3k", "$3k – $7k", "$7k – $15k", "$15k+"] as const;
export const TIMELINES = ["ASAP (< 1 week)", "2 – 3 weeks", "1 – 2 months", "Flexible"] as const;
export const BOOKING_SLOTS = ["10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM"] as const;

/** Strip control chars, HTML tags and collapse whitespace. */
export function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[<>]/g, "")
    .trim();
}

const clean = (min: number, max: number, label: string) =>
  z
    .string()
    .transform(sanitize)
    .pipe(
      z
        .string()
        .min(min, `${label} must be at least ${min} characters`)
        .max(max, `${label} is too long`),
    );

export const contactSchema = z.object({
  name: clean(2, 120, "Name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(200),
  company: z
    .string()
    .optional()
    .transform((v) => (v ? sanitize(v).slice(0, 160) : undefined)),
  serviceType: z.enum(SERVICE_TYPES),
  budget: z.enum(BUDGETS),
  timeline: z.enum(TIMELINES),
  message: clean(10, 4000, "Message"),
  source: z.enum(["contact-terminal", "contact-page", "quick-drawer"]).optional().default("contact-terminal"),
  // honeypot — must stay empty
  website: z.string().max(0, "Bot detected").optional(),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;

export const bookingSchema = z.object({
  name: clean(2, 120, "Name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(200),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date")
    .refine((d) => new Date(`${d}T23:59:59`).getTime() >= Date.now() - 86_400_000, "Date must be in the future"),
  slot: z.enum(BOOKING_SLOTS),
  projectType: z.enum(SERVICE_TYPES),
  notes: z
    .string()
    .optional()
    .transform((v) => (v ? sanitize(v).slice(0, 1000) : undefined)),
});

export type BookingInput = z.input<typeof bookingSchema>;

export function flattenErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}