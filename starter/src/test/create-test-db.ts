// Hjelper for testene: en tom database i minnet med de ekte migrasjonene, og to
// brukere. Hver test får sin egen, så de ikke påvirker hverandre.

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { relations } from "@/db/relations";
import { users } from "@/db/schema";
import type { SessionUser } from "@/features/auth/auth-types";

export const testUser: SessionUser = {
  id: 1,
  name: "Test Testesen",
  email: "test@example.com",
  role: "user",
};

export const testAdmin: SessionUser = {
  id: 2,
  name: "Admin Adminsen",
  email: "admin@example.com",
  role: "admin",
};

export async function createTestDb() {
  const db = drizzle({ client: new Database(":memory:"), relations });
  migrate(db, { migrationsFolder: "./drizzle/migrations" });
  await db.insert(users).values([testUser, testAdmin]);
  return db;
}
