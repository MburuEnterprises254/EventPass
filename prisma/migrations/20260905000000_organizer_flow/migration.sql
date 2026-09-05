-- CreateSchema (additive — organizer flow milestone)
-- Adds VenueSection.capacity and TicketType.perOrderLimit / promoEligible.
-- Do NOT apply until the owner reconnects the database; the migration history
-- must be applied in order (init → organizer-flow) when DATABASE_URL is back.

-- AlterTable
ALTER TABLE "VenueSection" ADD COLUMN "capacity" INTEGER;

-- AlterTable
ALTER TABLE "TicketType" ADD COLUMN "perOrderLimit" INTEGER;
ALTER TABLE "TicketType" ADD COLUMN "promoEligible" BOOLEAN NOT NULL DEFAULT true;