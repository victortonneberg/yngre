import type { QuestionDTO } from "../question-mapper";

// Ett spørsmål i listen: tittel som lenke, et utdrag og når det ble stilt.
export function QuestionItem({ question }: { question: QuestionDTO }) {
  const { id, title, content, createdAt } = question;

  return (
    <article className="question">
      <h2>
        <a href={`/questions/${id}`}>{title}</a>
      </h2>
      <p>{content.length > 200 ? `${content.slice(0, 200)}…` : content}</p>
      <small className="question__meta">
        <time dateTime={createdAt}>
          {new Date(createdAt).toLocaleDateString("no-NO")}
        </time>
      </small>
    </article>
  );
}
