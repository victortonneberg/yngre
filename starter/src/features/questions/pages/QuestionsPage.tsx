import { service } from "../question-service";
import { QuestionList } from "../components/QuestionList";

// Forsiden. En server-komponent: den henter spørsmålene fra servicen mens den
// rendres, uten fetch, og nettleseren får ferdig HTML.
export async function QuestionsPage() {
  const result = await service.list();

  return (
    <main>
      <h1>Spørsmål og svar</h1>
      <p>Still et spørsmål, så svarer en admin.</p>

      {result.ok ? (
        <QuestionList questions={result.data} />
      ) : (
        <p role="alert" className="alert">
          {result.error.message}
        </p>
      )}
    </main>
  );
}
