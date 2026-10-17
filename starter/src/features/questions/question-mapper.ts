import type { Question } from "@/db/schema";

// Det klienten får se. userId utelates med vilje.
export type QuestionDTO = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export function toQuestionDTO(question: Question): QuestionDTO {
  const { id, title, content, createdAt } = question;

  return {
    id,
    title,
    content,
    createdAt: createdAt.toISOString(),
  };
}
