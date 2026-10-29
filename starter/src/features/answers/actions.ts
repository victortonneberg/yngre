"use server";

import { requestInfo } from "rwsdk/worker";
import type { AnswerDTO } from "./answer-mapper";
import { service } from "./answer-service";

type FormError = {
  code: string;
  message: string;
  fieldErrors: Record<string, string[]>;
};

export type CreateAnswerFormValues = { content: string };

// Hva skjemaet får tilbake. ok: false tar med verdien, så teksten blir stående
// i stedet for å bli tømt når noe er feil.
export type CreateAnswerFormState =
  | { ok: true; data: AnswerDTO }
  | { ok: false; error: FormError; values: CreateAnswerFormValues }
  | null;

// Server actions går utenom vaktene på API-rutene (requireAdmin). Servicen
// sjekker derfor selv at du er innlogget (401) og admin (403).
export async function createAnswerAction(
  _prevState: CreateAnswerFormState,
  formData: FormData,
): Promise<CreateAnswerFormState> {
  // <input type="hidden" name="questionId" /> og <textarea name="content" />
  const questionId = String(formData.get("questionId") ?? "");
  const values: CreateAnswerFormValues = {
    content: String(formData.get("content") ?? ""),
  };

  const { ctx } = requestInfo;

  const result = await service.create(ctx.user, questionId, values);

  return result.ok
    ? { ok: true, data: result.data }
    : { ok: false, error: result.error, values };
}

export type DeleteAnswerResult = { ok: true } | { ok: false; error: FormError };

// Hvert spørsmål har høyst ett svar, så svaret finnes via spørsmålets id.
export async function deleteAnswerAction(
  formData: FormData,
): Promise<DeleteAnswerResult> {
  const questionId = String(formData.get("questionId") ?? "");

  const { ctx } = requestInfo;

  const result = await service.remove(ctx.user, questionId);

  return result.ok ? { ok: true } : { ok: false, error: result.error };
}
