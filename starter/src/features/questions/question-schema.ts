import z from "zod";

// Hva en bruker får sende inn. userId er med vilje utelatt: den kommer fra
// innloggingen, ikke fra klienten. Lengde og andre regler: utils/validate-question.ts.
export const createQuestionSchema = z.object({
  title: z.string("Tittel må være tekst").trim(),
  content: z.string("Innhold må være tekst").trim(),
  categoryId: z.string("Kategori må være tekst"),
});

// Alle felt valgfrie, så { title } holder ved endring.
export const updateQuestionSchema = createQuestionSchema.partial();

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
