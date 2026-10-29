import type { RequestInfo } from "rwsdk/worker";
import { service as answerService } from "@/features/answers/answer-service";
import { service as questionService } from "../question-service";

// Én side for ett spørsmål, med svaret under. Server-komponent, så alt hentes
// fra servicene mens siden rendres. Alle kan se den, innlogget eller ikke.
export async function QuestionPage({ params, response }: RequestInfo) {
  const question = await questionService.findById(params.id);

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

  // 404 fra answer-servicen betyr bare at spørsmålet ikke er besvart ennå.
  const answer = await answerService.findByQuestion(params.id);

  const { title, content, createdAt } = question.data;

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

      <section className="answer" aria-labelledby="answer-heading">
        <h2 id="answer-heading">Svar</h2>
        {answer.ok ? (
          <>
            <p>{answer.data.content}</p>
            <small className="question__meta">
              <time dateTime={answer.data.createdAt}>
                {new Date(answer.data.createdAt).toLocaleDateString("no-NO")}
              </time>
            </small>
          </>
        ) : answer.error.code === "404" ? (
          <p>Ikke besvart ennå.</p>
        ) : (
          <p role="alert" className="alert">
            {answer.error.message}
          </p>
        )}
      </section>

      <p>
        <a href="/">Til forsiden</a>
      </p>
    </main>
  );
}
