// Relations v2, som er måten Drizzle v1 gjør det på.
//
// Alle relasjoner defineres i ETT kall, ikke per tabell med `relations()` slik
// det var i 0.x. `fields`/`references` heter nå `from`/`to`.
//
// Det er dette objektet som gjør at
// `db.query.questions.findFirst({ with: { user: true } })` virker. Det sendes
// til `drizzle(..., { relations })` i ./index.ts.
import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    // En bruker har mange spørsmål, og en admin har mange svar.
    questions: r.many.questions({ from: r.users.id, to: r.questions.userId }),
    answers: r.many.answers({ from: r.users.id, to: r.answers.adminId }),
  },
  questions: {
    // `optional: false` gjør relasjonen ikke-nullbar i typen.
    user: r.one.users({
      from: r.questions.userId,
      to: r.users.id,
      optional: false,
    }),
    answers: r.many.answers({ from: r.questions.id, to: r.answers.questionId }),
  },
  answers: {
    question: r.one.questions({
      from: r.answers.questionId,
      to: r.questions.id,
      optional: false,
    }),
    admin: r.one.users({
      from: r.answers.adminId,
      to: r.users.id,
      optional: false,
    }),
  },
}));

export type Relations = typeof relations;
