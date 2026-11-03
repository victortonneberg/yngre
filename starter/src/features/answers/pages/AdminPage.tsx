import type { RequestInfo } from "rwsdk/worker";
import { QuestionList } from "@/features/questions/components/QuestionList";
import { service as questionService } from "@/features/questions/question-service";

// Admin-visningen: spørsmålene som venter på svar. Åpner admin et spørsmål, er
// svarskjemaet der. Ruten har requireAdminPage, og servicen sjekker rollen også.
export async function AdminPage({ ctx }: RequestInfo) {
  const result = await questionService.listUnanswered(ctx.user);

  return (
    <main>
      <h1>Ubesvarte spørsmål</h1>
      <p>Åpne et spørsmål for å svare.</p>

      {!result.ok ? (
        <p role="alert" className="alert">
          {result.error.message}
        </p>
      ) : result.data.length === 0 ? (
        <p>Alle spørsmål er besvart.</p>
      ) : (
        <QuestionList questions={result.data} />
      )}
    </main>
  );
}
