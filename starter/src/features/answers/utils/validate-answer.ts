// Reglene for et svar. Ren funksjon: ingen db og ingen HTTP, så den er lett å teste.

export const CONTENT_MAX_LENGTH = 5000;

type AnswerValidation =
  { ok: true } | { ok: false; field: "content"; error: string };

export function validateAnswer(answer: { content: string }): AnswerValidation {
  const content = answer.content.trim();

  // Et svar uten tekst gir ingen mening.
  if (content.length === 0) {
    return { ok: false, field: "content", error: "Svaret kan ikke være tomt" };
  }

  if (content.length > CONTENT_MAX_LENGTH) {
    return {
      ok: false,
      field: "content",
      error: `Svaret kan være maks ${CONTENT_MAX_LENGTH} tegn`,
    };
  }

  return { ok: true };
}
