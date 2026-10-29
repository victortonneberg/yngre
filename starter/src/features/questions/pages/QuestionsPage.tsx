import type { RequestInfo } from "rwsdk/worker";
import { service } from "../question-service";
import { CreateQuestionForm } from "../components/CreateQuestionForm";
import { QuestionList } from "../components/QuestionList";

// Forsiden. En server-komponent: den henter spørsmålene fra servicen mens den
// rendres, uten fetch, og nettleseren får ferdig HTML.
export async function QuestionsPage({ ctx }: RequestInfo) {
  const result = await service.list();

  return (
    <main>
      <h1>Spørsmål og svar</h1>
      <p>Still et spørsmål, så svarer en admin.</p>

      <section aria-labelledby="new-question">
        <h2 id="new-question">Still et spørsmål</h2>
        {ctx.user ? (
          <CreateQuestionForm />
        ) : (
          <p>
            <a href="/login">Logg inn</a> for å stille et spørsmål.
          </p>
        )}
      </section>

      <section aria-labelledby="all-questions">
        <h2 id="all-questions">Alle spørsmål</h2>
        {result.ok ? (
          <QuestionList questions={result.data} />
        ) : (
          <p role="alert" className="alert">
            {result.error.message}
          </p>
        )}
      </section>
    </main>
  );
}
