import { describe, expect, it } from "vitest";
import { TITLE_MAX_LENGTH, validateQuestion } from "../validate-question";

describe("validateQuestion", () => {
  it("godtar gyldig tittel og innhold", () => {
    const result = validateQuestion({ title: "Hei", content: "Et spørsmål" });

    expect(result).toEqual({ ok: true });
  });

  it("avviser tom tittel", () => {
    const result = validateQuestion({ title: "   " });

    expect(result).toMatchObject({ ok: false, field: "title" });
  });

  it("avviser for lang tittel", () => {
    const result = validateQuestion({
      title: "a".repeat(TITLE_MAX_LENGTH + 1),
    });

    expect(result).toMatchObject({ ok: false, field: "title" });
  });

  it("sjekker bare feltene som er med", () => {
    // Ved endring kan bare tittelen være sendt inn, uten innhold.
    expect(validateQuestion({ title: "Ny tittel" })).toEqual({ ok: true });
  });
});
