// Her bor reglene for svar: bare admin kan skrive, spørsmålet må finnes, og et
// spørsmål har høyst ett svar. Servicen vet ikke noe om HTTP eller Drizzle.
// Brukeren sendes inn utenfra (fra innloggingen), aldri fra klienten.

import z from "zod";
import { isAdmin, type SessionUser } from "@/features/auth/auth-types";
import {
  type QuestionService,
  service as questionService,
} from "@/features/questions/question-service";
import type { Fail, Result } from "@/lib/shared/result";
import { type AnswerDTO, toAnswerDTO } from "./answer-mapper";
import { type AnswerRepository, repository } from "./answer-repository";
import { createAnswerSchema } from "./answer-schema";
import { validateAnswer } from "./utils/validate-answer";

export interface AnswerService {
  findByQuestion(questionId: string): Promise<Result<AnswerDTO>>;
  create(
    user: SessionUser | null,
    questionId: string,
    input: unknown,
  ): Promise<Result<AnswerDTO>>;
  update(
    user: SessionUser | null,
    questionId: string,
    input: unknown,
  ): Promise<Result<AnswerDTO>>;
  remove(
    user: SessionUser | null,
    questionId: string,
  ): Promise<{ ok: true } | Fail>;
}

export function createAnswerService(
  _repository: AnswerRepository,
  _questions: QuestionService,
): AnswerService {
  // Bare admin får skrive. Gir null når alt er i orden, ellers feilen.
  const checkAdmin = (user: SessionUser): Fail | null => {
    if (isAdmin(user)) return null;

    return {
      ok: false,
      error: {
        code: "403",
        message: "Bare admin kan svare på spørsmål",
        fieldErrors: {},
      },
    };
  };

  const notAnswered = (): Fail => ({
    ok: false,
    error: {
      code: "404",
      message: "Spørsmålet er ikke besvart ennå",
      fieldErrors: {},
    },
  });

  return {
    async findByQuestion(questionId) {
      // Finnes ikke spørsmålet, sier vi det i stedet for å late som det er ubesvart.
      const question = await _questions.findById(questionId);
      if (!question.ok) return question;

      const result = await _repository.findByQuestion(questionId);
      if (!result.ok) return result;
      if (!result.data) return notAnswered();

      return {
        ok: true,
        data: toAnswerDTO(result.data),
      };
    },
    async create(user, questionId, input) {
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

      // Sjekk om bruker er admin
      const forbidden = checkAdmin(user);
      if (forbidden) return forbidden;

      // Sjekker at input har riktig form.
      const parsed = createAnswerSchema.safeParse(input);
      if (!parsed.success)
        return {
          ok: false,
          error: {
            code: "400",
            message: "Feil med data",
            fieldErrors: z.flattenError(parsed.error).fieldErrors,
          },
        };

      // Regler for innhold.
      const rule = validateAnswer(parsed.data);
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

      // Spørsmålet må finnes.
      const question = await _questions.findById(questionId);
      if (!question.ok) return question;

      // Sjekker om spørsmålet allerede har et svar.

      const existing = await _repository.findByQuestion(questionId);
      if (!existing.ok) return existing;

      if (existing.data) {
        return {
          ok: false,
          error: {
            code: "400",
            message: "Spørsmålet har allerede et svar",
            fieldErrors: {},
          },
        };
      }

      // Lagre. adminId setter vi selv, så ingen kan svare i andres navn.
      const result = await _repository.create({
        questionId,
        adminId: user.id,
        content: parsed.data.content,
      });
      if (!result.ok) return result;

      return {
        ok: true,
        data: toAnswerDTO(result.data),
      };
    },
    async update(user, questionId, input) {
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

      const forbidden = checkAdmin(user);
      if (forbidden) return forbidden;

      const parsed = createAnswerSchema.safeParse(input);
      if (!parsed.success)
        return {
          ok: false,
          error: {
            code: "400",
            message: "Feil med data",
            fieldErrors: z.flattenError(parsed.error).fieldErrors,
          },
        };

      const rule = validateAnswer(parsed.data);
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

      // Svaret må finnes for at vi skal kunne endre det.
      const existing = await _repository.findByQuestion(questionId);
      if (!existing.ok) return existing;
      if (!existing.data) return notAnswered();

      const result = await _repository.update(existing.data.id, {
        content: parsed.data.content,
      });
      if (!result.ok) return result;

      // Ingen rad ble endret, så svaret ble slettet etter at vi sjekket.
      if (!result.data) return notAnswered();

      return {
        ok: true,
        data: toAnswerDTO(result.data),
      };
    },
    async remove(user, questionId) {
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

      const forbidden = checkAdmin(user);
      if (forbidden) return forbidden;

      const existing = await _repository.findByQuestion(questionId);
      if (!existing.ok) return existing;
      if (!existing.data) return notAnswered();

      const result = await _repository.remove(existing.data.id);
      if (!result.ok) return result;

      return { ok: true };
    },
  };
}

export const service = createAnswerService(repository, questionService);
