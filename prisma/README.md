# EventPass — Prisma schema

The full 15-entity data model for the EventPass multi-tenant event ticketing
platform lives in `prisma/schema.prisma`. Prisma 6 is pinned (`@prisma/client@6` +
`prisma@6` in `package.json`).

## Entities
User, Organizer, Event, Venue, VenueSection, Seat, TicketType, Ticket, Order,
Payment, PromoCode, CheckIn, Refund, Notification, AuditLog.

## Apply the schema to a database (once credentials arrive)

Supabase is the database. Add these to the environment:
- `DATABASE_URL` — Supabase Postgres connection string (required for Prisma)
- `DIRECT_URL` — direct (non-pooled) connection, recommended for migrations

Then, from the site directory:

```bash
# Build the Prisma client + validate the schema
bunx prisma generate
bunx prisma validate

# Create the initial migration from the schema, then apply it to the DB
bunx prisma migrate dev --name init
# ...or, if you prefer to apply the checked-in SQL directly:
bunx prisma migrate deploy
```

The initial migration SQL is already generated and checked in at
`prisma/migrations/20260827000000_init/migration.sql` (created from the schema
with `prisma migrate diff --from-empty`), so `prisma migrate deploy` will apply
it exactly.

## Roles / RBAC

Authentication is Supabase Auth; `User.role` (enum Role:
PLATFORM_ADMIN | ORGANIZER | STAFF | CUSTOMER) + the Supabase user's
`app_metadata.role` drive authorization, enforced server-side by
`requireRole()` in `src/lib/auth/authServer.ts`.

Sign-up creates a CUSTOMER. To promote a user, run the seed script — see
`prisma/seed.ts` for the exact command.
