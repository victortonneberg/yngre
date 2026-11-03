import { beforeEach, describe, expect, it } from "vitest";
import { createTestDb, testAdmin, testUser } from "@/test/create-test-db";
import { createQuestionRepository } from "../question-repository";
import {
  createQuestionService,
  type QuestionService,
} from "../question-service";

let service: QuestionService;

beforeEach(async () => {
  const db = await createTestDb();
  service = createQuestionService(createQuestionRepository(db));
});

describe("questionService", () => {
  it("krever innlogging for å stille spørsmål", async () => {
    const result = await service.create(null, {
      title: "Hei",
      content: "Hva?",
    });

    expect(result).toMatchObject({ ok: false, error: { code: "401" } });
  });

  it("lager spørsmålet uten å sende ut userId", async () => {
    const result = await service.create(testUser, {
      title: "Hei",
      content: "Hva?",
    });

    expect(result.ok && result.data).toMatchObject({
      title: "Hei",
      isOwner: true,
    });
    expect(result.ok && result.data).not.toHaveProperty("userId");
  });

  it("lar bare eieren slette spørsmålet", async () => {
    const created = await service.create(testUser, {
      title: "Hei",
      content: "Hva?",
    });
    if (!created.ok) throw new Error("Kunne ikke lage spørsmålet");

    const byOther = await service.remove(testAdmin, created.data.id);
    const byOwner = await service.remove(testUser, created.data.id);

    expect(byOther).toMatchObject({ ok: false, error: { code: "403" } });
    expect(byOwner).toEqual({ ok: true });
  });
});
