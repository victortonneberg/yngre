import type { QuestionDTO } from "../question-mapper";
import { QuestionItem } from "./QuestionItem";

export function QuestionList({ questions }: { questions: QuestionDTO[] }) {
  if (questions.length === 0) {
    return <p>Ingen spørsmål ennå.</p>;
  }

  return (
    <ul>
      {questions.map((question) => (
        <li key={question.id}>
          <QuestionItem question={question} />
        </li>
      ))}
    </ul>
  );
}
