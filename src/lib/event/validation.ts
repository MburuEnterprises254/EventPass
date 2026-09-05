// EventPass — Zod schemas for the organizer flow (milestone 2).
// Mirrors prisma/schema.prisma: Event, Venue, VenueSection, Seat, TicketType.
// Everything is validated server-side inside createEvent; the same schemas are
// reused by the client form for instant feedback via safeParse.
//
// Money is transported as whole-unit strings (e.g. "1200.00") and converted to
// Prisma Decimal server-side, matching the schema's @db.Decimal(10,2) columns.

import { z } from "zod";

// ── Money ──────────────────────────────────────────────────────────────────

/** Matches "12", "12.5", "1200.00", "0", rejects negatives and junk. */
const moneyString = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount (e.g. 1200.00)");

const CURRENCIES = ["USD", "KES", "EUR", "GBP"] as const;

// ── Venue ──────────────────────────────────────────────────────────────────

export const venueSchema = z
  .object({
    name: z.string().trim().min(1, "Venue name is required").max(160),
    address: z.string().trim().max(255).optional().or(z.literal("")),
    city: z.string().trim().max(120).optional().or(z.literal("")),
    country: z.string().trim().max(120).optional().or(z.literal("")),
    timezone: z.string().trim().max(64).optional().or(z.literal("")),
    capacity: z.coerce.number().int().min(0).max(100_000).optional(),
  })
  .strict();

export type VenueInput = z.infer<typeof venueSchema>;

// ── Seating ────────────────────────────────────────────────────────────────

/**
 * A single row definition for a reserved section, plus the seat-number range
 * to auto-generate in that row. E.g. row "A", seats 1–12 → A1 … A12.
 * rowLabel is a full label (e.g. "Balcony row A"); startNumber/endNumber are
 * inclusive and at least 1 (start <= end).
 */
export const rowSchema = z
  .object({
    label: z
      .string()
      .trim()
      .min(1, "Row label is required")
      .max(16)
      .regex(/^[A-Za-z0-9][A-Za-z0-9\s-]*$/, "Row label may only contain letters, numbers, spaces and dashes"),
    start: z.coerce.number().int().min(1, "Seat numbering must start at 1 or higher").max(999, "Seat numbers max out at 999"),
    end: z.coerce.number().int().min(1, "Seat numbering must end at 1 or higher").max(9999, "Seat numbers max out at 9999"),
  })
  .strict()
  .refine((r) => r.end >= r.start, {
    message: "Last seat number must be >= first seat number",
    path: ["end"],
  });

export type RowInput = z.infer<typeof rowSchema>;

export const gaSectionSchema = z
  .object({
    kind: z.literal("GENERAL_ADMISSION"),
    name: z.string().trim().min(1, "Section name is required").max(120),
    capacity: z.coerce.number().int().min(0, "GA capacity cannot be negative").max(100_000),
  })
  .strict();

export type GaSectionInput = z.infer<typeof gaSectionSchema>;

export const reservedSectionSchema = z
  .object({
    kind: z.literal("RESERVED"),
    name: z.string().trim().min(1, "Section name is required").max(120),
    // Seats are generated from rows; rows/columns are derived on the server and
    // stored on VenueSection for reference.
    rows: z.array(rowSchema).min(1, "Add at least one row").max(200, "Too many rows"),
  })
  .strict()
  .refine((s) => new Set(s.rows.map((r) => r.label)).size === s.rows.length, {
    message: "Row labels must be unique within a section",
    path: ["rows"],
  });

export type ReservedSectionInput = z.infer<typeof reservedSectionSchema>;

export const sectionSchema = z.discriminatedUnion("kind", [gaSectionSchema, reservedSectionSchema]);
export type SectionInput = z.infer<typeof sectionSchema>;

// ── Ticket types ───────────────────────────────────────────────────────────

export const ticketTypeSchema = z
  .object({
    name: z.string().trim().min(1, "Ticket type name is required").max(120),
    description: z.string().trim().max(500).optional().or(z.literal("")),
    price: moneyString,
    quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(999_999),
    perOrderLimit: z.coerce.number().int().min(1).max(100).optional(),
    promoEligible: z.boolean().default(true),
    salesStartAt: z.string().datetime({ offset: true }).optional().nullable(),
    salesEndAt: z.string().datetime({ offset: true }).optional().nullable(),
  })
  .strict()
  .refine((t) => !t.salesStartAt || !t.salesEndAt || t.salesEndAt > t.salesStartAt, {
    message: "Sale end must be after sale start",
    path: ["salesEndAt"],
  });

export type TicketTypeInput = z.infer<typeof ticketTypeSchema>;

// ── Event (everything) ─────────────────────────────────────────────────────

export const EVENT_STATUSES = ["DRAFT", "PUBLISHED"] as const;

export const createEventSchema = z
  .object({
    name: z.string().trim().min(1, "Event name is required").max(160),
    description: z.string().trim().max(4000).optional().or(z.literal("")),
    startsAt: z.iso.datetime({ offset: true }).refine((v) => v.length > 0, "Event start must be a valid date/time"),
    endsAt: z.iso.datetime({ offset: true }).optional().nullable(),
    status: z.enum(EVENT_STATUSES).default("DRAFT"),
    capacity: z.coerce.number().int().min(0, "Capacity cannot be negative").max(1_000_000).optional(),
    imageUrl: z
      .string()
      .trim()
      .url("Thumbnail must be a valid URL")
      .optional()
      .or(z.literal("")),
    currency: z.enum(CURRENCIES).default("KES"),
    salesStartAt: z.string().datetime({ offset: true }).optional().nullable(),
    salesEndAt: z.string().datetime({ offset: true }).optional().nullable(),
    venue: venueSchema,
    seatingKind: z.enum(["GENERAL_ADMISSION", "RESERVED"]).default("GENERAL_ADMISSION"),
    sections: z.array(sectionSchema).optional().default([]),
    ticketTypes: z.array(ticketTypeSchema).min(1, "Add at least one ticket type"),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.endsAt && data.endsAt <= data.startsAt) {
      ctx.addIssue({ code: "custom", path: ["endsAt"], message: "Event end must be after the start." });
    }
    if (data.salesEndAt && data.salesStartAt && data.salesEndAt <= data.salesStartAt) {
      ctx.addIssue({ code: "custom", path: ["salesEndAt"], message: "Sale end must be after sale start." });
    }
    if (
      data.seatingKind === "RESERVED" &&
      (!data.sections || data.sections.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["sections"],
        message: "Reserved-seating events need at least one section with rows.",
      });
    }
  });

export type CreateEventInput = z.infer<typeof createEventSchema>;