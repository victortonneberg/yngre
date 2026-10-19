// Her tar vi imot requesten og sender svaret tilbake. Ingen regler her, de bor
// i servicen. Vi gjør bare JSON og URL om til et kall, og feilkoden om til status.

import type { RequestInfo } from "rwsdk/worker";
import { type QuestionService, service } from "./question-service";

// Midlertidig, til innloggingen er på plass: alle spørsmål lages av brukeren
// fra seed. Når vi har requireUser, hentes denne fra ctx.user i stedet.
const TODO_USER_ID = 1;

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
    async create({ request }: RequestInfo) {
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

      const result = await _service.create(TODO_USER_ID, body);

      // ok: true gir 201 (opprettet), ellers 400 eller 500 fra servicen.
      return result.ok
        ? Response.json(result, { status: 201 })
        : Response.json(result, { status: Number(result.error.code) });
    },
    // PATCH /api/v1/questions/:id med JSON, f.eks. { "title": "Ny tittel" }
    async update({ request, params }: RequestInfo) {
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

      const result = await _service.update(TODO_USER_ID, params.id, body);

      return result.ok
        ? Response.json(result, { status: 200 })
        : Response.json(result, { status: Number(result.error.code) });
    },
    // DELETE /api/v1/questions/:id
    async remove({ params }: RequestInfo) {
      const result = await _service.remove(TODO_USER_ID, params.id);

      // ok: true gir 204 (ingen body), ellers 403, 404 eller 500.
      return result.ok
        ? new Response(null, { status: 204 })
        : Response.json(result, { status: Number(result.error.code) });
    },
  };
}

export const controller = createQuestionController(service);
