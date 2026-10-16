import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createId } from "@/lib/id";

export const categories = sqliteTable("categories", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
  name: text("name").notNull().unique(),
});

export type Category = typeof categories.$inferSelect;
