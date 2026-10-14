# Arkitektur

Kort oppsummering av referanseløsningen i `../../tasks` (læreren sin `tasks`-app).
Referansen er fasit for lag og mønstre. Der koden og `docs/arkitektur.html` i
referansen er uenige, gjelder koden. Stiene under er relative til referansen.

Vi **kopierer og tilpasser** inn i vårt repo. Vi importerer aldri fra referansen.

## Lagene

Én feature = én mappe `src/features/<ressurs>/`. Forespørselen går nedover,
svaret oppover.

| Lag | Fil i referansen | Ansvar |
| --- | --- | --- |
| Ruter | `src/features/tasks/task-routes.ts` | URL + HTTP-metode → controller-funksjon. Mellomvare (`requireUser`) settes her |
| Controller | `src/features/tasks/task-controller.ts` | Leser request (query, `params`, JSON), kaller service, gjør `error.code` om til HTTP-status |
| Service | `src/features/tasks/task-service.ts` | Reglene: valider, kall repository, map til DTO. Kjenner verken HTTP eller Drizzle |
| Repository | `src/features/tasks/task-repository.ts` | Eneste sted som importerer `db`. try/catch → feilverdi |
| Mapper | `src/features/tasks/task-mapper.ts` | `toTaskDTO(row)`: bestemmer hva klienten ser |
| Zod-skjema | `src/features/tasks/task-schema.ts` | Form på input (`createTaskSchema`, `updateTaskSchema = partial()`) |
| Regler | `src/features/tasks/utils/validate-task.ts`, `validate-list-params.ts`, `parse-params.ts`, `date.ts` | Rene funksjoner uten db og HTTP |
| Klient-API | `src/features/tasks/task-api.ts` | `fetch` mot eget REST-API fra klientkomponenter |
| Server actions | `src/features/tasks/actions.ts` (`"use server"`) | Skjema og knapper. Kaller `service` direkte, ikke via HTTP |
| Sider | `src/features/tasks/pages/TasksPage.tsx` (server), `TasksPageClient.tsx` | Serversiden henter via `service`, uten fetch |
| Komponenter | `src/features/tasks/components/*.tsx` | `"use client"` bare ved state/hendelser, alltid linje 1 |
| DB | `src/db/schema/*-schema.ts`, `src/db/relations.ts`, `src/db/index.ts` | Drizzle-tabeller, `defineRelations`, `db` og `DB`-typen |
| Delt | `src/lib/id.ts`, `src/lib/result.ts` | `createId()` (nanoid), feilkoder |
| Inngang | `src/worker.tsx` | `defineApp([...])`: headere, API-ruter (utenfor `render`), sider (inni `render(Document, …)`) |

Avhengighetsretning: routes → controller → service → repository → db.
Server actions og serversider går til service. Service importerer aldri
controller, `Request` eller `Response`.

## Factory og DI

Hvert lag er en factory som får laget under seg som argument, og en ferdig
instans nederst i fila:

```ts
// task-repository.ts
export function createTaskRepository(_db: DB): TaskRepository { return { … } }
export const repository = createTaskRepository(db);

// task-service.ts
export function createTaskService(_repository: TaskRepository): TaskService { … }
export const service = createTaskService(repository);

// task-controller.ts
export function createTaskController(_service: TaskService): TaskController { … }
export const controller = createTaskController(service);
```

Hvert lag har et `interface` (`TaskRepository`, `TaskService`, `TaskController`)
som er kontrakten laget over kjenner. Appen bruker de ferdige instansene
(`controller`, `service`); tester lager sine egne med en annen `db`.

## Result-formen

Ingen lag kaster for forventede feil. Alle returnerer:

```ts
| { ok: true; data: T }                 // slett: bare { ok: true }
| { ok: false; error: { code: "400" | "404" | "500"; message: string;
                         fieldErrors: Record<string, string[]> } }
```

- Repository: databasefeil → `console.error` + `code: "500"`. «Fant ikke» er
  `{ ok: true, data: null }`, ikke en feil.
- Service: ugyldig input → `"400"`, `data === null` → `"404"`.
- Hvert lag sender feil videre uendret: `if (!result.ok) return result;`.
- Controller bruker `Number(result.error.code)` som HTTP-status. Suksess: 200,
  opprettet 201, slettet 204 uten body.
- HTTP-body er hele resultatet: `{ ok, data }` eller `{ ok: false, error }`.

Merk: `src/lib/result.ts` har en annen form (`success`, `Errors.BAD_REQUEST`).
Feature-koden bruker den ikke (bare `src/lib/demo-chaos.ts` gjør det).

## DTO og mapper

Databaseraden (`Task`, fra `src/db/schema/task-schema.ts`) forlater aldri
servicen. Servicen kaller `toTaskDTO` først. Mapperen utelater interne felt
(`userId`) og gjør `createdAt` om til ISO-tekst. Komponenter, controller og
server actions bruker bare `TaskDTO`.

## Validering med Zod

- Alt utenfra er `unknown` helt til `schema.safeParse(input)` i servicen.
  Controller sender `await request.json()` som `unknown`. Aldri `as`.
- Feil: `z.flattenError(parsed.error).fieldErrors` → `fieldErrors` i svaret.
- Tre trinn i servicen: (1) Zod for form, (2) `validate-*.ts` for
  forretningsregler (rene funksjoner, `now` som argument), (3) repository.
- Query-parametre er tekst: `utils/validate-list-params.ts` gjør dem om til
  typede verdier og gir `field` + `error` ved feil.
- `update` bruker `partial()`; tom body gir `"400"`.

## Innlogging og autorisasjon

**Referansen har ikke dette ferdig.** Det som finnes:

- Plassholdere `// requireUser` / `// requireAdmin` i `task-routes.ts`
  (mellomvare per metode; rwsdk-ruter tar en liste).
- `export type AppContext = {}` i `src/worker.tsx`. `types/rw.d.ts` gjør
  `ctx` typet i hele appen når feltet legges til.
- Servicen setter `userId: 1` fast til innlogging er på plass.
- `better-auth 1.7.x` i versjonslista, `nodejs_compat` i `wrangler.jsonc` og
  `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` (utkommentert) i `.dev.vars.example`.

For oss: `requireUser`/`requireAdmin` lages som rwsdk-mellomvare i
`task-routes.ts`-stil som setter `ctx.user` eller svarer 401/403 i samme
feilform. Service får brukeren som parameter og eier tilgangssjekken («er dette
din ressurs?»), ikke controlleren. Konkret better-auth-oppsett finnes ikke i
referansen: **spør før du velger mønster.**

## Testoppsett

Config: `vitest.config.ts`. `globals: true`, `@` → `src`, miljø `node`,
`setupFiles: src/test/setup-dom.ts` (jest-dom). Alias `cloudflare:workers` →
`src/test/cloudflare-workers.ts` (stub `export const env = {} as Env`), fordi
`src/db/index.ts` importerer modulen.

| Nivå | Eksempel | Teknikk |
| --- | --- | --- |
| Enhet | `src/features/tasks/__tests__/task-mapper.test.ts` | Rene funksjoner, ingen db |
| Integrasjon | `src/features/tasks/__tests__/task-service.test.ts` | `better-sqlite3` `:memory:` + `migrate(db, { migrationsFolder: "./drizzle/migrations" })` + `createTaskService(createTaskRepository(db))` |
| Komponent | `src/features/tasks/__tests__/TaskFilter.test.tsx` | `// @vitest-environment happy-dom` på linje 1, Testing Library + `userEvent` |
| E2E | `e2e/home.e2e.ts` | Playwright, kun viktige flyter |

Integrasjonstest: tabellene settes opp av de ekte migrasjonene, `users`-rad
legges inn i `beforeEach` (fremmednøkkel). Ny `db` per test.

## For vår app

- Bytt `tasks` med våre ressurser. Behold filnavnmønsteret
  `<ressurs>-routes|controller|service|repository|mapper|schema.ts`.
- API-stier: `/api/v1/<ressurser>` (flertall) og `/api/v1/<ressurser>/:id`.
- Registrer rutene i `src/worker.tsx` med `...<ressurs>Routes` før
  `render(...)`, og sider inni `render(Document, [...])`.
- Nytt fagområde = ny mappe under `src/features/`. Ingen deling av repository
  på tvers; trenger en feature data fra en annen, kall dens service.
- Tabeller i `src/db/schema/<ressurs>-schema.ts`, re-eksportert fra
  `src/db/schema/index.ts`. Relasjoner kun i `src/db/relations.ts`.
- Si alltid hvilken referansefil du fulgte. Mangler mønsteret (innlogging; også
  `action`-endepunktet i controlleren er ikke ferdig i referansen), spør.
