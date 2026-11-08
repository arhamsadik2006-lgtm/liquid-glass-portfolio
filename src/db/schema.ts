// src/db/schema.ts
import { pgTable, serial, text, timestamp, varchar, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";
import type { AspectRatio, CategoryId, DockGroup, Tool } from "@/lib/projects";

export const inquiries = pgTable(
  "inquiries",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 200 }).notNull(),
    company: varchar("company", { length: 160 }),
    serviceType: varchar("service_type", { length: 64 }).notNull(),
    budget: varchar("budget", { length: 64 }).notNull(),
    timeline: varchar("timeline", { length: 64 }).notNull(),
    message: text("message").notNull(),
    source: varchar("source", { length: 40 }).notNull().default("contact-terminal"),
    status: varchar("status", { length: 24 }).notNull().default("new"),
    ipHash: varchar("ip_hash", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("inquiries_created_idx").on(t.createdAt), index("inquiries_email_idx").on(t.email)],
);

export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 200 }).notNull(),
    preferredDate: varchar("preferred_date", { length: 32 }).notNull(),
    slot: varchar("slot", { length: 32 }).notNull(),
    projectType: varchar("project_type", { length: 64 }).notNull(),
    notes: text("notes"),
    status: varchar("status", { length: 24 }).notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("bookings_created_idx").on(t.createdAt)],
);

/** Dynamic portfolio projects added via the /admin dashboard */
export const customProjects = pgTable(
  "custom_projects",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 140 }).notNull().unique(),
    title: varchar("title", { length: 180 }).notNull(),
    client: varchar("client", { length: 140 }).notNull(),
    category: varchar("category", { length: 64 }).$type<CategoryId>().notNull(),
    label: varchar("label", { length: 80 }).notNull(),
    runtime: varchar("runtime", { length: 32 }).notNull().default("1:00"),
    year: integer("year").notNull().default(2026),
    thumbnail: text("thumbnail").notNull(),
    videoUrl: text("video_url").notNull(),
    aspectRatio: varchar("aspect_ratio", { length: 16 }).$type<AspectRatio>().notNull().default("16:9"),
    tools: jsonb("tools").$type<Tool[]>().notNull().default([]),
    dock: jsonb("dock").$type<DockGroup[]>().notNull().default([]),
    accent: varchar("accent", { length: 32 }).notNull().default("#a855f7"),
    summary: text("summary").notNull(),
    views: integer("views").notNull().default(100000),
    featured: boolean("featured").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("custom_projects_created_idx").on(t.createdAt)],
);

export type Inquiry = typeof inquiries.$inferSelect;
export type NewInquiry = typeof inquiries.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type CustomProjectRow = typeof customProjects.$inferSelect;