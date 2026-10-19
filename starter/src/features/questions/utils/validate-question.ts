export const TITLE_MAX_LENGTH = 200;
export const CONTENT_MAX_LENGTH = 5000;
type QuestionField = "title" | "content";

type QuestionValidation =
  { ok: true } | { ok: false; field: QuestionField; error: string };

// Sjekker bare feltene som er med, så den virker for både opprett og endre.
export function validateQuestion(question: {
  title?: string;
  content?: string;
}): QuestionValidation {
  if (question.title !== undefined) {
    const title = question.title.trim();
    if (title.length === 0) {
      return { ok: false, field: "title", error: "Tittel kan ikke være tom" };
    }
    if (title.length > TITLE_MAX_LENGTH) {
      return {
        ok: false,
        field: "title",
        error: `Tittel kan være maks ${TITLE_MAX_LENGTH} tegn`,
      };
    }
  }

  if (question.content !== undefined) {
    const content = question.content.trim();
    if (content.length === 0) {
      return {
        ok: false,
        field: "content",
        error: "Innhold kan ikke være tomt",
      };
    }
    if (content.length > CONTENT_MAX_LENGTH) {
      return {
        ok: false,
        field: "content",
        error: `Innhold kan være maks ${CONTENT_MAX_LENGTH} tegn`,
      };
    }
  }

  return { ok: true };
}
