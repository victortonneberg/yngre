import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const USER_ROLES = ["user", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/**
 * `role` bestemmer hvem som kan svare på spørsmål: bare admin. Selve sjekken
 * hører hjemme i servicen, ikke i databasen.
 */
export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  role: text({ enum: USER_ROLES }).notNull().default("user"),
});

// Typen utledes FRA tabellen, så den kan aldri komme i utakt med skjemaet.
export type User = typeof users.$inferSelect;
export type CreateUser = typeof users.$inferInsert;
