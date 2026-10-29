"use client";

import { useActionState } from "react";
import { createAnswerAction, type CreateAnswerFormState } from "../actions";

// Skjema for å svare på et spørsmål. Bare admin ser det. Klientkomponent fordi
// useActionState holder på feilmeldinger og ventetilstand.
export function AnswerForm({ questionId }: { questionId: string }) {
  const [state, formAction, isPending] = useActionState<
    CreateAnswerFormState,
    FormData
  >(createAnswerAction, null);

  const failed = state?.ok === false ? state : null;
  const contentError = failed?.error.fieldErrors.content?.[0];

  return (
    <form action={formAction} className="form">
      <input type="hidden" name="questionId" value={questionId} />

      <label htmlFor="answer-content">Skriv svar</label>
      <textarea
        id="answer-content"
        name="content"
        rows={5}
        defaultValue={failed?.values.content ?? ""}
        aria-invalid={contentError ? true : undefined}
      />
      {contentError && <p className="alert">{contentError}</p>}

      {/* Feil som ikke hører til et felt, for eksempel 403 eller 404. */}
      {failed && !contentError && (
        <p role="alert" className="alert">
          {failed.error.message}
        </p>
      )}

      <button type="submit" className="button" disabled={isPending}>
        {isPending ? "Sender …" : "Send svar"}
      </button>
    </form>
  );
}
