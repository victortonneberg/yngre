import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./user-schema";
import { questions } from "./question-schema";
import { createId } from "@/lib/id";

/**
Hvert spørsmål kan ha ett svar fordi questionId er unik.
Når spørsmålet slettes, slettes svaret automatisk. Adminen kan ikke slettes.
At adminId tilhører en admin, kontrolleres i answer-service.
 */

export const answers = sqliteTable(
  "answers",
  {
    id: text("id")
      .primaryKey()
      .$default(() => createId()),
    questionId: text("question_id")
      .notNull()
      .unique()
      .references(() => questions.id, { onDelete: "cascade" }),
    adminId: integer("admin_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    content: text("content").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$default(() => new Date()),
  },
  (table) => [index("idx_answers_admin_id").on(table.adminId)],
);

export type Answer = typeof answers.$inferSelect;
export type CreateAnswer = typeof answers.$inferInsert;
export type UpdateAnswer = Partial<CreateAnswer>;
