import type { Category, Question } from "@/db/schema";

// Spørsmålet slik repository henter den: spørsmålet med kategorien ved siden av.
export type QuestionWithCategory = Question & { category: Category };

// Det klienten får se. userId utelates med vilje.
export type QuestionDTO = {
  id: string;
  title: string;
  content: string;
  category: { id: string; name: string };
  createdAt: string;
};

export function toQuestionDTO(question: QuestionWithCategory): QuestionDTO {
  const { id, title, content, category, createdAt } = question;

  return {
    id,
    title,
    content,
    category: { id: category.id, name: category.name },
    createdAt: createdAt.toISOString(),
  };
}
