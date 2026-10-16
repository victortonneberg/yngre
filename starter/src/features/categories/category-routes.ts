// REST-rutene for categories samlet ett sted. Bare lesing, så ingen mellomvare.

import { route } from "rwsdk/router";
import { controller } from "./category-controller";

export const categoryRoutes = [
  route("/api/v1/categories", { get: controller.list }),
  route("/api/v1/categories/:id", { get: controller.find }),
];
