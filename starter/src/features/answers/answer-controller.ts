// Her tar vi imot requesten og sender svaret tilbake. Ingen regler her, de bor
// i servicen. Vi gjør bare JSON og URL om til et kall, og feilkoden om til status.
// Hvert spørsmål har høyst ett svar, så :id i URL-en er spørsmålets id.

import type { RequestInfo } from "rwsdk/worker";
import { type AnswerService, service } from "./answer-service";

// Midlertidig, til innloggingen er på plass: alle svar skrives av admin fra
// seed. Når vi har requireAdmin, hentes denne fra ctx.user i stedet.
const TODO_ADMIN = { id: 2, role: "admin" } as const;

export interface AnswerController {
  find(requestInfo: RequestInfo): Promise<Response>;
  create(requestInfo: RequestInfo): Promise<Response>;
  update(requestInfo: RequestInfo): Promise<Response>;
  remove(requestInfo: RequestInfo): Promise<Response>;
}

export function createAnswerController(
  _service: AnswerService,
): AnswerController {
  return {
    // GET /api/v1/questions/:id/answer
    async find({ params }: RequestInfo) {
      const result = await _service.findByQuestion(params.id);

      // ok: true gir 200, ellers 404 (finnes ikke eller ubesvart) eller 500.
      return result.ok
        ? Response.json(result, { status: 200 })
        : Response.json(result, { status: Number(result.error.code) });
    },
    // POST /api/v1/questions/:id/answer med JSON, f.eks. { "content": "Svar" }
    async create({ request, params }: RequestInfo) {
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

      const result = await _service.create(TODO_ADMIN, params.id, body);

      // Det servicen kan svare, og statusen vi sender:
      //   ok: true   201  svaret er opprettet
      //   "400"      400  feil form, brudd på reglene, eller har svar fra før
      //   "403"      403  brukeren er ikke admin
      //   "404"      404  spørsmålet finnes ikke
      //   "500"      500  noe gikk galt i databasen
      return result.ok
        ? Response.json(result, { status: 201 })
        : Response.json(result, { status: Number(result.error.code) });
    },
    // PATCH /api/v1/questions/:id/answer med JSON, f.eks. { "content": "Nytt svar" }
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

      const result = await _service.update(TODO_ADMIN, params.id, body);

      // ok: true gir 200, ellers 400, 403, 404 (ikke besvart) eller 500.
      return result.ok
        ? Response.json(result, { status: 200 })
        : Response.json(result, { status: Number(result.error.code) });
    },
    // DELETE /api/v1/questions/:id/answer
    async remove({ params }: RequestInfo) {
      const result = await _service.remove(TODO_ADMIN, params.id);

      // ok: true gir 204 (ingen body), ellers 403, 404 eller 500.
      return result.ok
        ? new Response(null, { status: 204 })
        : Response.json(result, { status: Number(result.error.code) });
    },
  };
}

export const controller = createAnswerController(service);
