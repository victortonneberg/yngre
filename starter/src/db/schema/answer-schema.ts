import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./user-schema";
import { questions } from "./question-schema";
import { createId } from "@/lib/id";

/**
 * onDelete:
 *   questionId   cascade: slettes spørsmålet, slettes svarene
 *   adminId      restrict: en admin som har svart kan ikke slettes
 * At adminId faktisk er en admin sjekkes i answer-service, ikke her.
 */
export const answers = sqliteTable(
  "answers",
  {
    id: text("id")
      .primaryKey()
      .$default(() => createId()),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    adminId: integer("admin_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    content: text("content").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$default(() => new Date()),
  },
  (table) => [
    index("idx_answers_question_id").on(table.questionId),
    index("idx_answers_admin_id").on(table.adminId),
  ],
);

export type Answer = typeof answers.$inferSelect;
export type CreateAnswer = typeof answers.$inferInsert;
export type UpdateAnswer = Partial<CreateAnswer>;
