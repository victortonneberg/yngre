// Her samler vi REST-rutene for svar på ett sted, sammen med mellomvaren de
// trenger. Alle kan lese svaret. Å skrive krever admin.

import { route } from "rwsdk/router";
import { controller } from "./answer-controller";
import { requireAdmin } from "../auth/middleware";

export const answerRoutes = [
  route("/api/v1/questions/:id/answer", {
    get: controller.find,
    post: [requireAdmin, controller.create],
    patch: [requireAdmin, controller.update],
    delete: [requireAdmin, controller.remove],
  }),
];
