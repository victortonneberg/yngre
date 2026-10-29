import { isAdmin, type SessionUser } from "@/features/auth/auth-types";
import { service } from "../answer-service";
import { AnswerForm } from "./AnswerForm";
import { DeleteAnswerForm } from "./DeleteAnswerForm";

// Svardelen på spørsmålssiden. En server-komponent som henter svaret selv og
// velger hva som vises:
//   har svar        svaret, og slett-knapp for admin
//   ikke besvart    skjema for admin, ellers «Ikke besvart ennå»
export async function AnswerSection({
  questionId,
  user,
}: {
  questionId: string;
  user: SessionUser | null;
}) {
  const result = await service.findByQuestion(questionId);
  const admin = isAdmin(user);

  return (
    <section className="answer" aria-labelledby="answer-heading">
      <h2 id="answer-heading">Svar</h2>

      {result.ok ? (
        <>
          <p>{result.data.content}</p>
          <small className="question__meta">
            <time dateTime={result.data.createdAt}>
              {new Date(result.data.createdAt).toLocaleDateString("no-NO")}
            </time>
          </small>
          {admin && <DeleteAnswerForm questionId={questionId} />}
        </>
      ) : result.error.code === "404" ? (
        // 404 betyr at spørsmålet ikke er besvart ennå.
        admin ? (
          <AnswerForm questionId={questionId} />
        ) : (
          <p>Ikke besvart ennå.</p>
        )
      ) : (
        <p role="alert" className="alert">
          {result.error.message}
        </p>
      )}
    </section>
  );
}
