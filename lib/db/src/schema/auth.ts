import { sql } from 'drizzle-orm';
import { index, jsonb, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

// Sessions table — kept for compatibility; not used by the password-auth flow.
export const sessionsTable = pgTable(
  'sessions',
  {
    sid: varchar('sid').primaryKey(),
    sess: jsonb('sess').notNull(),
    expire: timestamp('expire').notNull(),
  },
  (table) => [index('IDX_session_expire').on(table.expire)],
);

export const usersTable = pgTable('users', {
  id: varchar('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: varchar('email').unique(),
  firstName: varchar('first_name'),
  lastName: varchar('last_name'),
  profileImageUrl: varchar('profile_image_url'),
  // Password hash — null for legacy/OAuth-only rows.
  passwordHash: varchar('password_hash'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;
