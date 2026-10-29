import type { Question } from "@/db/schema";
import type { SessionUser } from "@/features/auth/auth-types";

// Det klienten får se. userId utelates med vilje. I stedet sier isOwner om den
// innloggede brukeren eier spørsmålet, så siden vet om slett-knappen skal vises.
export type QuestionDTO = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isOwner: boolean;
};

export function toQuestionDTO(
  question: Question,
  user: SessionUser | null = null,
): QuestionDTO {
  const { id, title, content, createdAt } = question;

  return {
    id,
    title,
    content,
    createdAt: createdAt.toISOString(),
    isOwner: user !== null && user.id === question.userId,
  };
}
