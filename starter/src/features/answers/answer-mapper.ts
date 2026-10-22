import type { Answer } from "@/db/schema";

// Det klienten får se. adminId utelates med vilje, på samme måte som userId
// på spørsmål: vi sender ikke ut hvem som sitter bak.
export type AnswerDTO = {
  id: string;
  questionId: string;
  content: string;
  createdAt: string;
};

export function toAnswerDTO(answer: Answer): AnswerDTO {
  const { id, questionId, content, createdAt } = answer;

  return {
    id,
    questionId,
    content,
    createdAt: createdAt.toISOString(),
  };
}
