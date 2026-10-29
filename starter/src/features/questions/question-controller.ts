// Her tar vi imot requesten og sender svaret tilbake. Ingen regler her, de bor
// i servicen. Vi gjør bare JSON og URL om til et kall, og feilkoden om til status.

import type { RequestInfo } from "rwsdk/worker";
import { type QuestionService, service } from "./question-service";

export interface QuestionController {
  list(requestInfo: RequestInfo): Promise<Response>;
  find(requestInfo: RequestInfo): Promise<Response>;
  create(requestInfo: RequestInfo): Promise<Response>;
  update(requestInfo: RequestInfo): Promise<Response>;
  remove(requestInfo: RequestInfo): Promise<Response>;
}

export function createQuestionController(
  _service: QuestionService,
): QuestionController {
  return {
    // GET /api/v1/questions
    async list() {
      const result = await _service.list();

      // ok: true gir 200, ellers 500 fra servicen.
      return result.ok
        ? Response.json(result, { status: 200 })
        : Response.json(result, { status: Number(result.error.code) });
    },
    // GET /api/v1/questions/:id
    async find({ params }: RequestInfo) {
      const result = await _service.findById(params.id);

      // ok: true gir 200, ellers 404 (finnes ikke) eller 500.
      return result.ok
        ? Response.json(result, { status: 200 })
        : Response.json(result, { status: Number(result.error.code) });
    },
    // POST /api/v1/questions med JSON, f.eks. { "title": "Hei", "content": "…" }
    async create({ request, ctx }: RequestInfo) {
      // Body kan være hva som helst, så vi leser den som unknown.
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return Response.json(
          {
            ok: false,
            error: {
              code: "400",
              message: "Body må være JSON",
              fieldErrors: {},
            },
          },
          { status: 400 },
        );
      }

      // Hvem som eier spørsmålet kommer fra ctx.user, aldri fra bodyen.
      const result = await _service.create(ctx.user, body);

      // ok: true gir 201 (opprettet), ellers 400, 401 eller 500 fra servicen.
      return result.ok
        ? Response.json(result, { status: 201 })
        : Response.json(result, { status: Number(result.error.code) });
    },
    // PATCH /api/v1/questions/:id med JSON, f.eks. { "title": "Ny tittel" }
    async update({ request, params, ctx }: RequestInfo) {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return Response.json(
          {
            ok: false,
            error: {
              code: "400",
              message: "Body må være JSON",
              fieldErrors: {},
            },
          },
          { status: 400 },
        );
      }

      const result = await _service.update(ctx.user, params.id, body);

      return result.ok
        ? Response.json(result, { status: 200 })
        : Response.json(result, { status: Number(result.error.code) });
    },
    // DELETE /api/v1/questions/:id
    async remove({ params, ctx }: RequestInfo) {
      const result = await _service.remove(ctx.user, params.id);

      // ok: true gir 204 (ingen body), ellers 401, 403, 404 eller 500.
      return result.ok
        ? new Response(null, { status: 204 })
        : Response.json(result, { status: Number(result.error.code) });
    },
  };
}

export const controller = createQuestionController(service);
