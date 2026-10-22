// Eneste laget som snakker med databasen. Feil her blir { ok: false } med kode
// "500", og "fant ikke" er { ok: true, data: null }, ikke en feil.

import { eq } from "drizzle-orm";
import { type DB, db } from "@/db";
import {
  answers,
  type Answer,
  type CreateAnswer,
  type UpdateAnswer,
} from "@/db/schema";
import type { Fail, Result } from "@/lib/shared/result";

export interface AnswerRepository {
  // Hvert spørsmål har max ett svar. null = ikke besvart ennå.
  findByQuestion(questionId: string): Promise<Result<Answer | null>>;
  create(data: CreateAnswer): Promise<Result<Answer>>;
  update(id: string, data: UpdateAnswer): Promise<Result<Answer | null>>;
  remove(id: string): Promise<{ ok: true } | Fail>;
}

// Samme feil for alle metodene. Detaljene havner i loggen, ikke hos klienten.
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

export function createAnswerRepository(_db: DB): AnswerRepository {
  return {
    async findByQuestion(questionId) {
      try {
        const answer = await _db
          .select()
          .from(answers)
          .where(eq(answers.questionId, questionId))
          .get();
        return { ok: true, data: answer ?? null };
      } catch (error) {
        return fail(error);
      }
    },
    async create(data) {
      try {
        const answer = await _db.insert(answers).values(data).returning().get();
        return { ok: true, data: answer };
      } catch (error) {
        return fail(error);
      }
    },
    async update(id, data) {
      try {
        const answer = await _db
          .update(answers)
          .set(data)
          .where(eq(answers.id, id))
          .returning()
          .get();
        return { ok: true, data: answer ?? null };
      } catch (error) {
        return fail(error);
      }
    },
    async remove(id) {
      try {
        await _db.delete(answers).where(eq(answers.id, id));
        return { ok: true };
      } catch (error) {
        return fail(error);
      }
    },
  };
}

export const repository = createAnswerRepository(db);
