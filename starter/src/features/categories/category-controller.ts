// Tar imot requesten og sender svaret. Ingen regler her, de bor i servicen.

import type { RequestInfo } from "rwsdk/worker";
import { type CategoryService, service } from "./category-service";

export interface CategoryController {
  list(requestInfo: RequestInfo): Promise<Response>;
  find(requestInfo: RequestInfo): Promise<Response>;
}

export function createCategoryController(
  _service: CategoryService,
): CategoryController {
  return {
    // GET /api/v1/categories
    async list() {
      const result = await _service.list();

      // ok: true gir 200, ellers 500 fra servicen.
      return Response.json(result, {
        status: result.ok ? 200 : Number(result.error.code),
      });
    },
    // GET /api/v1/categories/:id
    async find({ params }: RequestInfo) {
      const result = await _service.findById(params.id);

      // ok: true gir 200, ellers 404 (finnes ikke) eller 500.
      return Response.json(result, {
        status: result.ok ? 200 : Number(result.error.code),
      });
    },
  };
}

export const controller = createCategoryController(service);
