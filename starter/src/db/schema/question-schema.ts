import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./user-schema";
import { categories } from "./category-schema";
import { createId } from "@/lib/id";

/**
 * onDelete:
 *   userId       cascade: slettes brukeren, slettes spørsmålene hens
 *   categoryId   restrict: en kategori med spørsmål kan ikke slettes
 */
export const questions = sqliteTable(
  "questions",
  {
    id: text("id")
      .primaryKey()
      .$default(() => createId()),
    title: text("title").notNull(),
    content: text("content").notNull(),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$default(() => new Date()),
  },
  (table) => [
    index("idx_questions_user_id").on(table.userId),
    index("idx_questions_category_id").on(table.categoryId),
  ],
);

export type Question = typeof questions.$inferSelect;
export type CreateQuestion = typeof questions.$inferInsert;
export type UpdateQuestion = Partial<CreateQuestion>;
