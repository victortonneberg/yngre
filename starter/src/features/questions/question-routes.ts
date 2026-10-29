// Her samler vi REST-rutene for spørsmål på ett sted, sammen med mellomvaren
// de trenger. Alle kan lese. Å skrive krever innlogging.

import { route } from "rwsdk/router";
import { controller } from "./question-controller";
import { requireUser } from "../auth/middleware";

export const questionRoutes = [
  route("/api/v1/questions", {
    get: controller.list,
    post: [requireUser, controller.create],
  }),
  route("/api/v1/questions/:id", {
    get: controller.find,
    patch: [requireUser, controller.update],
    delete: [requireUser, controller.remove],
  }),
];
