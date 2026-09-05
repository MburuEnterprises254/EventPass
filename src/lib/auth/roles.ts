// Role model shared by auth + type-checks against the Prisma `Role` enum.
export const ROLES = [
  "PLATFORM_ADMIN",
  "ORGANIZER",
  "STAFF",
  "CUSTOMER",
] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/**
 * All roles, ordered from least to most privileged. Used by
 * `requireRole`'s "minimum role" helper and by future dashboards.
 */
export const ROLE_LEVEL: Record<Role, number> = {
  CUSTOMER: 0,
  STAFF: 1,
  ORGANIZER: 2,
  PLATFORM_ADMIN: 3,
};
