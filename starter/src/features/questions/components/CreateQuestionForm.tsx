"use client";

import { useActionState } from "react";
import { createQuestionAction, type CreateQuestionFormState } from "../actions";

// Skjema for nytt spørsmål. Må være en klientkomponent fordi useActionState
// holder på svaret fra serveren (feilmeldinger og ventetilstand).
export function CreateQuestionForm() {
  const [state, formAction, isPending] = useActionState<
    CreateQuestionFormState,
    FormData
  >(createQuestionAction, null);

  const failed = state?.ok === false ? state : null;
  const titleError = failed?.error.fieldErrors.title?.[0];
  const contentError = failed?.error.fieldErrors.content?.[0];

  return (
    <form action={formAction} className="form">
      <label htmlFor="title">Tittel</label>
      <input
        id="title"
        name="title"
        defaultValue={failed?.values.title ?? ""}
        aria-invalid={titleError ? true : undefined}
      />
      {titleError && <p className="alert">{titleError}</p>}

      <label htmlFor="content">Spørsmål</label>
      <textarea
        id="content"
        name="content"
        rows={5}
        defaultValue={failed?.values.content ?? ""}
        aria-invalid={contentError ? true : undefined}
      />
      {contentError && <p className="alert">{contentError}</p>}

      {/* Feil som ikke hører til et felt, for eksempel 401. */}
      {failed && !titleError && !contentError && (
        <p role="alert" className="alert">
          {failed.error.message}
        </p>
      )}

      <button type="submit" className="button" disabled={isPending}>
        {isPending ? "Sender …" : "Send spørsmål"}
      </button>
    </form>
  );
}
