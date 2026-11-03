// Integrasjonstest av hovedflyten: bruker stiller spørsmål, admin svarer, og
// alle kan se spørsmålet og svaret. Servicene og databasen er ekte (bare i
// minnet), så testen går gjennom alle lagene unntatt HTTP.

import { describe, expect, it } from "vitest";
import { createAnswerRepository } from "@/features/answers/answer-repository";
import { createAnswerService } from "@/features/answers/answer-service";
import { createQuestionRepository } from "@/features/questions/question-repository";
import { createQuestionService } from "@/features/questions/question-service";
import { createTestDb, testAdmin, testUser } from "@/test/create-test-db";

describe("hovedflyten", () => {
  it("bruker spør, admin svarer, og alle ser spørsmålet og svaret", async () => {
    const db = await createTestDb();
    const questions = createQuestionService(createQuestionRepository(db));
    const answers = createAnswerService(createAnswerRepository(db), questions);

    // 1. Bruker stiller et spørsmål.
    const asked = await questions.create(testUser, {
      title: "Hvordan søker jeg om studielån?",
      content: "Hvor og når må jeg søke?",
    });
    if (!asked.ok) throw new Error("Kunne ikke stille spørsmålet");
    const id = asked.data.id;

    // 2. Det vises for admin som ubesvart.
    const unanswered = await questions.listUnanswered(testAdmin);
    expect(unanswered.ok && unanswered.data.map((q) => q.id)).toEqual([id]);

    // 3. En vanlig bruker får ikke svare.
    const byUser = await answers.create(testUser, id, {
      content: "Jeg svarer",
    });
    expect(byUser).toMatchObject({ ok: false, error: { code: "403" } });

    // 4. Admin svarer.
    const answered = await answers.create(testAdmin, id, {
      content: "Du søker i Lånekassen.",
    });
    expect(answered.ok).toBe(true);

    // 5. Spørsmålet er ikke lenger ubesvart.
    const after = await questions.listUnanswered(testAdmin);
    expect(after.ok && after.data).toEqual([]);

    // 6. En utlogget ser både spørsmålet og svaret.
    const question = await questions.findById(id, null);
    const answer = await answers.findByQuestion(id);
    expect(question.ok && question.data.title).toBe(
      "Hvordan søker jeg om studielån?",
    );
    expect(answer.ok && answer.data.content).toBe("Du søker i Lånekassen.");
  });
});
