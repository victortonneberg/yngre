// Eneste laget som snakker med databasen. Feil her blir { ok: false } med kode
// "500", og "fant ikke" er { ok: true, data: null }, ikke en feil.

import { eq } from "drizzle-orm";
import { type DB, db } from "@/db";
import {
  questions,
  type CreateQuestion,
  type Question,
  type UpdateQuestion,
} from "@/db/schema";
import type { Fail, Result } from "@/lib/shared/result";

export interface QuestionRepository {
  // Nyeste først.
  findMany(): Promise<Result<Question[]>>;
  // null = ingen spørsmål med denne id-en
  findById(id: string): Promise<Result<Question | null>>;
  create(data: CreateQuestion): Promise<Result<Question>>;
  update(id: string, data: UpdateQuestion): Promise<Result<Question | null>>;
  remove(id: string): Promise<{ ok: true } | Fail>;
}

// Samme feil for alle metodene; detaljene havner i loggen, ikke hos klienten.
function fail(error: unknown): Fail {
  console.error(error);
  return {
    ok: false,
    error: {
      code: "500",
      message: "Noe gikk galt i databasen",
      fieldErrors: {},
    },
  };
}

export function createQuestionRepository(_db: DB): QuestionRepository {
  return {
    async findMany() {
      try {
        const rows = await _db.query.questions.findMany({
          orderBy: { createdAt: "desc" },
        });
        return { ok: true, data: rows };
      } catch (error) {
        return fail(error);
      }
    },
    async findById(id) {
      try {
        const question = await _db
          .select()
          .from(questions)
          .where(eq(questions.id, id))
          .get();
        return { ok: true, data: question ?? null };
      } catch (error) {
        return fail(error);
      }
    },
    async create(data) {
      try {
        const question = await _db
          .insert(questions)
          .values(data)
          .returning()
          .get();
        return { ok: true, data: question };
      } catch (error) {
        return fail(error);
      }
    },
    async update(id, data) {
      try {
        const question = await _db
          .update(questions)
          .set(data)
          .where(eq(questions.id, id))
          .returning()
          .get();
        return { ok: true, data: question ?? null };
      } catch (error) {
        return fail(error);
      }
    },
    async remove(id) {
      try {
        await _db.delete(questions).where(eq(questions.id, id));
        return { ok: true };
      } catch (error) {
        return fail(error);
      }
    },
  };
}

export const repository = createQuestionRepository(db);
