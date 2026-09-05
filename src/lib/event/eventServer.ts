// EventPass — organizer server functions (milestone 2).
//
// createEvent validates a full event (venue + seating + ticket types) with Zod
// and persists everything in ONE Prisma transaction. It requires the ORGANIZER
// role (server-side, see src/lib/auth/authServer.ts :: requireRole).
//
// IMPORTANT: every server-only dependency (Supabase admin client, cookie
// helpers, Prisma) is imported dynamically INSIDE handlers so this module stays
// importable from the browser — TanStack keeps a thin RPC stub client-side while
// handlers run server-side. Never import server-only modules at the top level.

import { createServerFn } from "@tanstack/react-start";
import { createEventSchema, type CreateEventInput } from "~/lib/event/validation";
import { requireRole } from "~/lib/auth/authServer";

const ORGANIZER_ONLY = ["ORGANIZER"] as const;

/** Server-side error surfaced to the form (message + optional field path). */
export class EventError extends Error {
  status: number;
  field?: string;
  constructor(message: string, status = 400, field?: string) {
    super(message);
    this.status = status;
    this.field = field;
    this.name = "EventError";
  }
}

/** True when the app can actually talk to Postgres right now. */
async function dbAvailable(): Promise<boolean> {
  const { hasDatabase } = await import("~/lib/db/prisma");
  return hasDatabase();
}

type CreateEventResult = {
  ok: true;
  event: {
    id: string;
    name: string;
    startsAt: string;
    status: string;
    venue: { id: string; name: string };
    seatsGenerated: number;
  };
};

const createEvent = createServerFn()
  .validator((d: CreateEventInput) => createEventSchema.parse(d))
  .handler(async ({ data }): Promise<CreateEventResult> => {
    const principal = await requireRole([...ORGANIZER_ONLY]);
    if (!(await dbAvailable())) {
      throw new EventError(
        "The database isn't connected yet — creating events will work as soon as it is. No changes were saved.",
        503,
      );
    }

    const { getPrisma } = await import("~/lib/db/prisma");
    const prisma = getPrisma();

    // Resolve (or create) the organizer profile for this principal. The
    // ORGANIZER role is set on the Supabase user by the seed script; the app
    // User row may not exist yet, so upsert it defensively.
    const appUser = await prisma.user.upsert({
      where: { supabaseId: principal.supabaseId },
      create: {
        supabaseId: principal.supabaseId,
        email: principal.email ?? "",
        name: principal.name ?? null,
        role: "ORGANIZER",
      },
      update: { email: principal.email ?? "" },
      select: { id: true },
    });

    const organizer = await prisma.organizer.findUnique({ where: { userId: appUser.id } });
    let organizerId: string;
    if (organizer) {
      organizerId = organizer.id;
    } else {
      const created = await prisma.organizer.create({
        data: {
          userId: appUser.id,
          name: principal.name ?? principal.email ?? "My organization",
          contactEmail: principal.email ?? null,
          description: null,
          website: null,
        },
        select: { id: true },
      });
      organizerId = created.id;
    }

    // Build the seat rows for RESERVED sections (before the transaction) next.
    const ticketsForSale = data.ticketTypes.reduce((sum, t) => sum + t.quantity, 0);

    // Capacity: explicit overrides; otherwise derived (GA sections) or the sum
    // of generated seats (reserved sections).
    let derivedCapacity = 0;
    for (const section of data.sections) {
      if (section.kind === "GENERAL_ADMISSION") {
        derivedCapacity += section.capacity;
      } else {
        for (const row of section.rows) {
          derivedCapacity += row.end - row.start + 1;
        }
      }
    }
    const effectiveCapacity = data.capacity ?? derivedCapacity;

    // ── Persist everything in a single transaction ──
    const created = await prisma.$transaction(async (tx) => {
      const venue = await tx.venue.create({
        data: {
          organizerId,
          name: data.venue.name,
          address: data.venue.address || null,
          city: data.venue.city || null,
          country: data.venue.country || null,
          timezone: data.venue.timezone || null,
          capacity: effectiveCapacity || null,
        },
      });

      const event = await tx.event.create({
        data: {
          organizerId,
          venueId: venue.id,
          name: data.name,
          description: data.description || null,
          startsAt: new Date(data.startsAt),
          endsAt: data.endsAt ? new Date(data.endsAt) : null,
          status: data.status,
          seatingKind: data.seatingKind,
          capacity: effectiveCapacity,
          currency: data.currency,
          imageUrl: data.imageUrl || null,
          salesStartAt: data.salesStartAt ? new Date(data.salesStartAt) : null,
          salesEndAt: data.salesEndAt ? new Date(data.salesEndAt) : null,
        },
      });

      let seatsGenerated = 0;
      for (const section of data.sections) {
        const seatData = section.kind === "GENERAL_ADMISSION"
          ? {
              name: section.name,
              kind: "GENERAL_ADMISSION" as const,
              capacity: section.capacity,
              rows: null,
              columns: null,
              price: null,
            }
          : {
              name: section.name,
              kind: "RESERVED" as const,
              rows: section.rows.reduce((m, r) => Math.max(m, rowNumberDigit(r.label)), 0) || null,
              columns: section.rows.length
                ? Math.max(...section.rows.map((r) => r.end - r.start + 1))
                : null,
              capacity: section.rows.reduce((sum, r) => sum + (r.end - r.start + 1), 0),
              price: null,
            };

        const createdSection = await tx.venueSection.create({
          data: { venueId: venue.id, ...seatData },
        });

        if (section.kind === "RESERVED") {
          const seats = section.rows.flatMap((row) =>
            range(row.start, row.end).map((n) => ({
              sectionId: createdSection.id,
              label: `${row.label.trim()}${n}`,
              row: row.label.trim(),
            })),
          );
          if (seats.length > 0) {
            await tx.seat.createMany({ data: seats, skipDuplicates: true });
            seatsGenerated += seats.length;
          }
        }
      }

      const ticketTypes = data.ticketTypes.map((t) => ({
        eventId: event.id,
        name: t.name,
        description: t.description || null,
        price: t.price, // Prisma coerces the numeric string to Decimal
        quantityAvailable: t.quantity,
        perOrderLimit: t.perOrderLimit ?? null,
        promoEligible: t.promoEligible,
        salesStartAt: t.salesStartAt ? new Date(t.salesStartAt) : null,
        salesEndAt: t.salesEndAt ? new Date(t.salesEndAt) : null,
      }));
      await tx.ticketType.createMany({ data: ticketTypes });

      await tx.auditLog.create({
        data: {
          userId: appUser.id,
          action: "event.created",
          entityType: "Event",
          entityId: event.id,
          metadata: {
            eventName: data.name,
            seatingKind: data.seatingKind,
            seatsGenerated,
            ticketTypes: data.ticketTypes.length,
            ticketsForSale,
          },
        },
      });

      return { event, venue, seatsGenerated };
    });

    return {
      ok: true,
      event: {
        id: created.event.id,
        name: created.event.name,
        startsAt: created.event.startsAt.toISOString(),
        status: created.event.status,
        venue: { id: created.venue.id, name: created.venue.name },
        seatsGenerated: created.seatsGenerated,
      },
    };
  });

/** Small helpers (module-private, pure). */
function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

/** Rough "row letter position" — A=1 … Z=26, AA=27 … Used for row sorting only. */
function rowNumberDigit(label: string): number {
  const m = label.trim().toUpperCase().match(/^([A-Z]+)/);
  if (!m) return 0;
  let v = 0;
  for (const ch of m[1]) v = v * 26 + (ch.charCodeAt(0) - 64);
  return v;
}

// ── Organizer dashboard: list this organizer's events ──────────────────────

export type EventListItem = {
  id: string;
  name: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  status: string;
  seatingKind: string;
  capacity: number | null;
  currency: string;
  createdAt: string;
  venueName: string | null;
  ticketTypes: { name: string; price: string; quantityAvailable: number; quantitySold: number | null }[];
};

const listOrganizerEvents = createServerFn().handler(async (): Promise<{
  dbConnected: boolean;
  events: EventListItem[];
  organizerName: string | null;
}> => {
  const principal = await requireRole([...ORGANIZER_ONLY]);
  let organizerName: string | null = null;

  if (!(await dbAvailable())) {
    // Graceful pre-DB state — the page renders, no events to show yet.
    return { dbConnected: false, events: [], organizerName };
  }

  const { getPrisma } = await import("~/lib/db/prisma");
  const prisma = getPrisma();

  const appUser = await prisma.user.findUnique({
    where: { supabaseId: principal.supabaseId },
    select: { id: true },
  });
  if (!appUser) return { dbConnected: true, events: [], organizerName: null };

  const organizer = await prisma.organizer.findUnique({
    where: { userId: appUser.id },
    select: { id: true, name: true },
  });
  if (!organizer) return { dbConnected: true, events: [], organizerName: null };

  const rows = await prisma.event.findMany({
    where: { organizerId: organizer.id },
    orderBy: { startsAt: "desc" },
    include: {
      venue: { select: { name: true } },
      ticketTypes: { select: { name: true, price: true, quantityAvailable: true, quantitySold: true } },
    },
  });

  return {
    dbConnected: true,
    organizerName: organizer.name,
    events: rows.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      startsAt: e.startsAt.toISOString(),
      endsAt: e.endsAt ? e.endsAt.toISOString() : null,
      status: e.status,
      seatingKind: e.seatingKind,
      capacity: e.capacity,
      currency: e.currency,
      createdAt: e.createdAt.toISOString(),
      venueName: e.venue.name,
      ticketTypes: e.ticketTypes.map((t) => ({
        name: t.name,
        price: t.price.toString(),
        quantityAvailable: t.quantityAvailable,
        quantitySold: t.quantitySold,
      })),
    })),
  };
});

export { createEvent, listOrganizerEvents };