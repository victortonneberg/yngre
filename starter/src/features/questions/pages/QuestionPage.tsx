import type { RequestInfo } from "rwsdk/worker";
import { AnswerSection } from "@/features/answers/components/AnswerSection";
import { service as questionService } from "../question-service";
import { DeleteQuestionForm } from "../components/DeleteQuestionForm";

// Én side for ett spørsmål, med svaret under. Server-komponent, så alt hentes
// fra servicene mens siden rendres. Alle kan se den, innlogget eller ikke.
export async function QuestionPage({ params, response, ctx }: RequestInfo) {
  const question = await questionService.findById(params.id, ctx.user);

  if (!question.ok) {
    // Ukjent id gir en ekte 404, ikke bare en tom side.
    response.status = Number(question.error.code);

    return (
      <main>
        <h1>Fant ikke spørsmålet</h1>
        <p role="alert" className="alert">
          {question.error.message}
        </p>
        <a href="/">Til forsiden</a>
      </main>
    );
  }

  const { id, title, content, createdAt, isOwner } = question.data;

  return (
    <main>
      <article className="question-detail">
        <h1>{title}</h1>
        <p>{content}</p>
        <small className="question__meta">
          <time dateTime={createdAt}>
            {new Date(createdAt).toLocaleDateString("no-NO")}
          </time>
        </small>
      </article>

      <AnswerSection questionId={id} user={ctx.user} />

      {/* Bare eieren ser slett-knappen. Servicen sjekker det også. */}
      {isOwner && <DeleteQuestionForm questionId={id} />}

      <p>
        <a href="/">Til forsiden</a>
      </p>
    </main>
  );
}
