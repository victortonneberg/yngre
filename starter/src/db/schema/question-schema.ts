import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./user-schema";
import { createId } from "@/lib/id";

/**
 * onDelete:
 *   userId   cascade: slettes brukeren, slettes spørsmålene hens
 */
export const questions = sqliteTable(
  "questions",
  {
    id: text("id")
      .primaryKey()
      .$default(() => createId()),
    title: text("title").notNull(),
    content: text("content").notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$default(() => new Date()),
  },
  (table) => [index("idx_questions_user_id").on(table.userId)],
);

export type Question = typeof questions.$inferSelect;
export type CreateQuestion = typeof questions.$inferInsert;
export type UpdateQuestion = Partial<CreateQuestion>;
