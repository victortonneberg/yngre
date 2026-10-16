// Eneste laget som snakker med databasen. Feil her blir { ok: false } med kode
// "500", og "fant ikke" er { ok: true, data: null }, ikke en feil.

import { eq } from "drizzle-orm";
import { type DB, db } from "@/db";
import {
  categories,
  type Category,
  type CreateCategory,
  type UpdateCategory,
} from "@/db/schema";
import type { Fail, Result } from "@/lib/shared/result";

export interface CategoryRepository {
  findMany(): Promise<Result<Category[]>>;
  // null = ingen kategori med denne id-en
  findById(id: string): Promise<Result<Category | null>>;
  create(data: CreateCategory): Promise<Result<Category>>;
  update(id: string, data: UpdateCategory): Promise<Result<Category | null>>;
  remove(id: string): Promise<{ ok: true } | Fail>;
}

// Samme feil for alle metodene; detaljene havner i loggen, ikke hos klienten.
function fail(error: unknown): Fail {
  console.error(error);
  return {
    ok: false,
    error: { code: "500", message: "Noe gikk galt i databasen", fieldErrors: {} },
  };
}

export function createCategoryRepository(_db: DB): CategoryRepository {
  return {
    async findMany() {
      try {
        const rows = await _db.query.categories.findMany({
          orderBy: { name: "asc" },
        });
        return { ok: true, data: rows };
      } catch (error) {
        return fail(error);
      }
    },
    async findById(id) {
      try {
        const row = await _db
          .select()
          .from(categories)
          .where(eq(categories.id, id))
          .get();
        return { ok: true, data: row ?? null };
      } catch (error) {
        return fail(error);
      }
    },
    async create(data) {
      try {
        const row = await _db.insert(categories).values(data).returning().get();
        return { ok: true, data: row };
      } catch (error) {
        return fail(error);
      }
    },
    async update(id, data) {
      try {
        const row = await _db
          .update(categories)
          .set(data)
          .where(eq(categories.id, id))
          .returning()
          .get();
        return { ok: true, data: row ?? null };
      } catch (error) {
        return fail(error);
      }
    },
    async remove(id) {
      try {
        await _db.delete(categories).where(eq(categories.id, id));
        return { ok: true };
      } catch (error) {
        return fail(error);
      }
    },
  };
}

// Ferdig instans mot ekte D1. Tester lager sin egen med createCategoryRepository.
export const repository = createCategoryRepository(db);
