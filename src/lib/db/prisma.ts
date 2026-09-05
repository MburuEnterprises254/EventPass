// Lazy Prisma client. Only instantiates when DATABASE_URL is present, so the
// app builds and the landing/auth UI work even before the DB is connected.
import { PrismaClient } from "@prisma/client";
import { env } from "~/lib/env";

let prisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (prisma) return prisma;
  if (!env.databaseUrl) {
    throw new Error(
      "DATABASE_URL is not configured. Add the Supabase Postgres connection string to run DB-backed code.",
    );
  }
  prisma = new PrismaClient();
  return prisma;
}

/** True when a database connection string is present (DB-backed code can run). */
export function hasDatabase(): boolean {
  return Boolean(env.databaseUrl);
}
