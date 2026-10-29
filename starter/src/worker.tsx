import { defineApp } from "rwsdk/worker";
import { layout, render, route } from "rwsdk/router";
import { Document } from "@/app/Document";
import { setCommonHeaders } from "@/app/headers";
import { AppLayout } from "@/components/Layout";
import type { SessionUser } from "@/features/auth/auth-types";
import { setUser } from "@/features/auth/middleware";
import { authRoutes } from "@/features/auth/auth-routes";
import { answerRoutes } from "@/features/answers/answer-routes";
import { QuestionsPage } from "@/features/questions/pages/QuestionsPage";
import { questionRoutes } from "@/features/questions/question-routes";

/**
 * Alt som ligger på `ctx` for én forespørsel. `user` settes av `setUser` og er
 * null når ingen er innlogget. types/rw.d.ts gjør at `ctx.user` er typet i
 * hele appen.
 */
export type AppContext = {
  user: SessionUser | null;
};

const app = defineApp([
  // Middleware. Kjører for hver forespørsel, i rekkefølgen de står.
  setCommonHeaders(),
  setUser,
  // Test Niko
  // API-rute. Ligger UTENFOR render(), så svaret er akkurat det handleren
  // returnerer: JSON, uten HTML-skall rundt.
  route("/api/status", () => Response.json({ status: "ok", version: "0.1.0" })),

  ...questionRoutes,
  ...answerRoutes,

  // Sider. render(Document, [...]) pakker dem i et helt HTML-dokument.
  render(Document, [
    layout(AppLayout, [route("/", QuestionsPage), ...authRoutes]),
  ]),
]);

export default { fetch: app.fetch };
