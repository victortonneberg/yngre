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
