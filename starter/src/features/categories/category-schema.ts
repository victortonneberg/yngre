import z from "zod";

// Form på input. Lengde og andre regler ligger i utils/validate-category.ts.
export const createCategorySchema = z.object({
  name: z.string("Navn må være tekst").trim(),
});

// Alle felt valgfrie, så { name } holder ved endring.
export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
