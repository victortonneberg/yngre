// Eneste laget som snakker med databasen. Feil her blir { ok: false } med kode
// "500", og "fant ikke" er { ok: true, data: null }, ikke en feil.

import { eq } from "drizzle-orm";
import { type DB, db } from "@/db";
import {
  questions,
  type CreateQuestion,
  type UpdateQuestion,
} from "@/db/schema";
import type { Fail, Result } from "@/lib/shared/result";
import type { QuestionWithCategory } from "./question-mapper";

export interface QuestionRepository {
  // categoryId er valgfritt filter. Nyeste først.
  findMany(categoryId?: string): Promise<Result<QuestionWithCategory[]>>;
  // null = ingen spørsmål med denne id-en
  findById(id: string): Promise<Result<QuestionWithCategory | null>>;
  create(data: CreateQuestion): Promise<Result<QuestionWithCategory>>;
  update(
    id: string,
    data: UpdateQuestion,
  ): Promise<Result<QuestionWithCategory | null>>;
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
  // Hent spørsmålet på nytt med kategorien, så create/update gir samme form som find.
  const withCategory = (id: string) =>
    _db.query.questions.findFirst({
      where: { id },
      with: { category: true },
    });

  return {
    async findMany(categoryId) {
      try {
        const rows = await _db.query.questions.findMany({
          where: { categoryId },
          with: { category: true },
          orderBy: { createdAt: "desc" },
        });
        return { ok: true, data: rows };
      } catch (error) {
        return fail(error);
      }
    },
    async findById(id) {
      try {
        const question = await withCategory(id);
        return { ok: true, data: question ?? null };
      } catch (error) {
        return fail(error);
      }
    },
    async create(data) {
      try {
        const { id } = await _db
          .insert(questions)
          .values(data)
          .returning({ id: questions.id })
          .get();
        const question = await withCategory(id);
        // Spørsmålet vi nettopp lagde må finnes.
        if (!question) throw new Error("Spørsmål mangler etter insert");
        return { ok: true, data: question };
      } catch (error) {
        return fail(error);
      }
    },
    async update(id, data) {
      try {
        const updated = await _db
          .update(questions)
          .set(data)
          .where(eq(questions.id, id))
          .returning({ id: questions.id })
          .get();
        if (!updated) return { ok: true, data: null };
        return { ok: true, data: (await withCategory(id)) ?? null };
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
