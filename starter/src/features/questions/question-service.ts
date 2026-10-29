// Her bor reglene for spørsmål: vi validerer, sjekker hvem som eier spørsmålet,
// snakker med repository og gjør svaret om til en DTO. Servicen vet ikke noe
// om HTTP eller Drizzle. Brukeren sendes inn utenfra (ctx.user), aldri fra
// klienten, og servicen sjekker selv at du er innlogget.

import z from "zod";
import type { SessionUser } from "@/features/auth/auth-types";
import type { Fail, Result } from "@/lib/shared/result";
import { type QuestionDTO, toQuestionDTO } from "./question-mapper";
import { type QuestionRepository, repository } from "./question-repository";
import { createQuestionSchema, updateQuestionSchema } from "./question-schema";
import { validateQuestion } from "./utils/validate-question";

export interface QuestionService {
  // Lesing er åpen for alle. Brukeren er valgfri og brukes bare til isOwner.
  list(user?: SessionUser | null): Promise<Result<QuestionDTO[]>>;
  findById(id: string, user?: SessionUser | null): Promise<Result<QuestionDTO>>;
  create(
    user: SessionUser | null,
    input: unknown,
  ): Promise<Result<QuestionDTO>>;
  update(
    user: SessionUser | null,
    id: string,
    input: unknown,
  ): Promise<Result<QuestionDTO>>;
  remove(user: SessionUser | null, id: string): Promise<{ ok: true } | Fail>;
}

export function createQuestionService(
  _repository: QuestionRepository,
): QuestionService {
  return {
    async list(user = null) {
      const result = await _repository.findMany();

      if (!result.ok) return result;

      return {
        ok: true,
        data: result.data.map((question) => toQuestionDTO(question, user)),
      };
    },
    async findById(id, user = null) {
      const result = await _repository.findById(id);

      if (!result.ok) return result;

      if (!result.data) {
        return {
          ok: false,
          error: {
            code: "404",
            message: "Spørsmål finnes ikke",
            fieldErrors: {},
          },
        };
      }

      return {
        ok: true,
        data: toQuestionDTO(result.data, user),
      };
    },
    async create(user, input) {
      // Du må være innlogget. Server actions går utenom vaktene på rutene, så
      // vi sjekker det her også.
      if (!user) {
        return {
          ok: false,
          error: {
            code: "401",
            message: "Du må være innlogget",
            fieldErrors: {},
          },
        };
      }

      // Først sjekker vi at input har riktig form. Zod fjerner ukjente felt.
      const parsed = createQuestionSchema.safeParse(input);
      if (!parsed.success)
        return {
          ok: false,
          error: {
            code: "400",
            message: "Feil med data",
            fieldErrors: z.flattenError(parsed.error).fieldErrors,
          },
        };

      // Så reglene våre: tittel og innhold kan ikke være tomme eller for lange.
      const rule = validateQuestion(parsed.data);
      if (!rule.ok) {
        return {
          ok: false,
          error: {
            code: "400",
            message: "Ikke gyldig data",
            fieldErrors: { [rule.field]: [rule.error] },
          },
        };
      }

      // Til slutt lagrer vi. userId setter vi selv, så ingen kan late som de er
      // en annen bruker.
      const result = await _repository.create({
        ...parsed.data,
        userId: user.id,
      });
      if (!result.ok) return result;

      return {
        ok: true,
        data: toQuestionDTO(result.data),
      };
    },
    async update(user, id, input) {
      // Du må være innlogget. Server actions går utenom vaktene på rutene, så
      // vi sjekker det her også.
      if (!user) {
        return {
          ok: false,
          error: {
            code: "401",
            message: "Du må være innlogget",
            fieldErrors: {},
          },
        };
      }

      // Alle felt er valgfrie, så det holder å sende med bare tittelen.
      const parsed = updateQuestionSchema.safeParse(input);
      if (!parsed.success)
        return {
          ok: false,
          error: {
            code: "400",
            message: "Feil med data",
            fieldErrors: z.flattenError(parsed.error).fieldErrors,
          },
        };

      // En tom body gir ingenting å endre.
      if (Object.keys(parsed.data).length === 0) {
        return {
          ok: false,
          error: {
            code: "400",
            message: "Ingen felt å oppdatere",
            fieldErrors: {},
          },
        };
      }

      // Samme regler som ved opprettelse, men bare for feltene som er med.
      const rule = validateQuestion(parsed.data);
      if (!rule.ok) {
        return {
          ok: false,
          error: {
            code: "400",
            message: "Ikke gyldig data",
            fieldErrors: { [rule.field]: [rule.error] },
          },
        };
      }

      // Spørsmålet må finnes, og du kan bare endre dine egne.
      const existing = await _repository.findById(id);
      if (!existing.ok) return existing;

      if (!existing.data) {
        return {
          ok: false,
          error: {
            code: "404",
            message: "Spørsmål finnes ikke",
            fieldErrors: {},
          },
        };
      }

      if (existing.data.userId !== user.id) {
        return {
          ok: false,
          error: {
            code: "403",
            message: "Du kan bare endre dine egne spørsmål",
            fieldErrors: {},
          },
        };
      }

      // Lagre. Hvis databasen feiler, sender vi feilen rett videre.
      const result = await _repository.update(id, parsed.data);
      if (!result.ok) return result;

      // Ingen rad ble endret, så spørsmålet ble slettet etter at vi sjekket.
      if (!result.data) {
        return {
          ok: false,
          error: {
            code: "404",
            message: "Spørsmål finnes ikke",
            fieldErrors: {},
          },
        };
      }

      return {
        ok: true,
        data: toQuestionDTO(result.data),
      };
    },
    async remove(user, id) {
      // Du må være innlogget. Server actions går utenom vaktene på rutene, så
      // vi sjekker det her også.
      if (!user) {
        return {
          ok: false,
          error: {
            code: "401",
            message: "Du må være innlogget",
            fieldErrors: {},
          },
        };
      }

      const existing = await _repository.findById(id);
      if (!existing.ok) return existing;

      if (!existing.data) {
        return {
          ok: false,
          error: {
            code: "404",
            message: "Spørsmål finnes ikke",
            fieldErrors: {},
          },
        };
      }

      if (existing.data.userId !== user.id) {
        return {
          ok: false,
          error: {
            code: "403",
            message: "Du kan bare slette dine egne spørsmål",
            fieldErrors: {},
          },
        };
      }

      const result = await _repository.remove(id);
      if (!result.ok) return result;

      return { ok: true };
    },
  };
}

export const service = createQuestionService(repository);
