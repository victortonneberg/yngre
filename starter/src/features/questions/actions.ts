"use server";

import { requestInfo } from "rwsdk/worker";
import type { QuestionDTO } from "./question-mapper";
import { service } from "./question-service";

export type CreateQuestionFormValues = { title: string; content: string };

// Hva skjemaet får tilbake. ok: false tar med verdiene, så skjemaet kan fylles
// ut igjen i stedet for å bli tomt når noe er feil.
export type CreateQuestionFormState =
  | { ok: true; data: QuestionDTO }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
        fieldErrors: Record<string, string[]>;
      };
      values: CreateQuestionFormValues;
    }
  | null;

// En server action går utenom vaktene på API-rutene (requireUser), så vi sender
// ctx.user til servicen, som sjekker innlogging selv.
export async function createQuestionAction(
  _prevState: CreateQuestionFormState,
  formData: FormData,
): Promise<CreateQuestionFormState> {
  // <input name="title" /> og <textarea name="content" />
  const values: CreateQuestionFormValues = {
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
  };

  const { ctx } = requestInfo;

  const result = await service.create(ctx.user, values);

  return result.ok
    ? { ok: true, data: result.data }
    : { ok: false, error: result.error, values };
}

// Slett-skjemaet får bare tilbake en feil. Går det bra, svarer vi med en
// omdirigering til forsiden i stedet: siden for spørsmålet finnes ikke lenger,
// og en omdirigering virker selv om skjemaet er borte når svaret kommer.
export type DeleteQuestionResult = {
  ok: false;
  error: {
    code: string;
    message: string;
    fieldErrors: Record<string, string[]>;
  };
};

// Servicen sjekker både innlogging (401) og at spørsmålet er ditt (403).
export async function deleteQuestionAction(
  formData: FormData,
): Promise<DeleteQuestionResult | Response> {
  // <input type="hidden" name="id" />
  const id = String(formData.get("id") ?? "");

  const { ctx } = requestInfo;

  const result = await service.remove(ctx.user, id);

  if (!result.ok) return { ok: false, error: result.error };

  return new Response(null, { status: 303, headers: { Location: "/" } });
}
