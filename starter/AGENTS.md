# Regler for kode og KI-verktøy

Startprosjekt for Webapplikasjoner 2026. Denne fila er ment både for dere og
for kodeverktøy som leser repoet (Claude Code, Cursor, Copilot).

## Versjoner

rwsdk 1.7.3 · React 19.2 · Vite 8.2 · TypeScript 7.0 · Zod 4.5 · Tailwind 4.3 ·
Drizzle 1.0.0-rc.4 (Relations v2) · better-auth 1.7 · Vitest 4.1 ·
wrangler 4.129

Slå opp dokumentasjon for **disse** versjonene før du foreslår et API. Ikke
eldre. Alle versjoner er låst uten `^` og `~`, med vilje.

## Fallgruver modellene går i

- **Drizzle.** npm sitt `latest`-merke på `drizzle-orm` peker fortsatt på
  versjon 0. Vi kjører versjon 1, som ligger under `rc`. En «oppdatering til
  siste» er en nedgradering, og da forsvinner halve API-et vi bruker.
  I versjon 1: `defineRelations` i `src/db/relations.ts`, ikke `relations()`
  per tabell. `db.query.*.findFirst({ where: { id } })` tar et filterobjekt,
  ikke `eq()`. `createInsertSchema` kommer fra `drizzle-orm/zod`, ikke fra en
  egen `drizzle-zod`-pakke.
- **Tailwind 4.** Tokens defineres i en `@theme`-blokk i `src/app/styles.css`.
  Det finnes ingen `tailwind.config.js`, og et forslag som lager en er et svar
  for versjon 3.
- **React Compiler.** Kjører som egen babel-transform i `vite.config.mts`, ikke
  via `react({ babel: ... })`, fordi Vite 8 bygger med rolldown.
- **Det er ikke Node.** Koden kjører i `workerd`. `fs`, `path` og `process`
  finnes ikke uten videre. En modulvariabel som teller noe virker lokalt og er
  feil i produksjon.

## Regler i dette prosjektet

- `"use client"` bare der det faktisk er state eller hendelser, og alltid på
  **linje 1**. En kommentar over gjør fila stille om til en server-modul.
- Alt som kommer utenfra valideres med Zod og `safeParse`. Aldri `as` for å
  slippe unna en type.
- `sql.raw` er forbudt. Bruk spørringsbyggeren, så bindes verdiene som
  parametre i stedet for å limes inn i teksten.
- Hemmeligheter i `.dev.vars` lokalt og `wrangler secret put` i produksjon.
  Aldri i `wrangler.jsonc`, som ligger i git.
- Forretningsregler og tilgangssjekker skriver dere selv. En modell kjenner
  ikke reglene deres, og gjetter.
- Legg logikk som kan testes uten å starte en server i egne funksjoner. Da kan
  dere teste den med Vitest på millisekunder.

## Referansearkitektur

Læreren sin ferdige løsning (`tasks`) ligger i `../../tasks`. Den er fasit for
lag og mønstre. En kort oppsummering med filstier står i
[`docs/arkitektur.md`](docs/arkitektur.md). Les den før du skriver kode.

- Kopier og tilpass mønstre inn i **vårt** repo. Importer aldri fra
  `../../tasks`, og endre aldri noe der.
- Oppgi hvilken referansefil du fulgte (f.eks. «følger
  `src/features/tasks/task-service.ts`»). Mangler mønsteret i referansen,
  spør i stedet for å gjette.
- Der referansekoden og `docs/arkitektur.html` i referansen er uenige, er det
  koden som gjelder. HTML-en er eldre.

## Filstruktur

Samme konvensjon som referansen: én mappe per ressurs under `src/features/`.
Innlogging er utsatt til vi har lært det. Da lages `src/features/auth/`.

| Vår fil | Følger referansefil |
| --- | --- |
| `src/db/schema/question-schema.ts`, `answer-schema.ts`, `category-schema.ts` | `src/db/schema/task-schema.ts` |
| `src/db/schema/index.ts`, `src/db/relations.ts` (utvides) | samme filer |
| `src/features/questions/question-{routes,controller,service,repository,mapper,schema,api}.ts` | tilsvarende `task-*.ts` |
| `src/features/questions/actions.ts` | `actions.ts` |
| `src/features/questions/utils/validate-question.ts` | `utils/validate-task.ts` |
| `src/features/questions/utils/validate-list-params.ts`, `parse-params.ts` | samme filer (søk er `?q=` på listeruta) |
| `src/features/questions/pages/QuestionsPage.tsx`, `QuestionPage.tsx` | `pages/TasksPage.tsx` |
| `src/features/questions/components/QuestionList.tsx`, `QuestionItem.tsx`, `QuestionFilter.tsx`, `CreateQuestionForm.tsx` | `components/Task*.tsx`, `CreateTaskForm.tsx` |
| `src/features/answers/answer-{routes,controller,service,repository,mapper,schema}.ts` | tilsvarende `task-*.ts` |
| `src/features/categories/category-{routes,controller,service,repository,mapper,schema}.ts` | tilsvarende `task-*.ts` |
| `__tests__/question-mapper.test.ts`, `question-service.test.ts`, `QuestionFilter.test.tsx` | `task-mapper.test.ts`, `task-service.test.ts`, `TaskFilter.test.tsx` |
| `src/test/cloudflare-workers.ts` + alias i `vitest.config.ts` | samme filer |

- API-stier: `/api/v1/<ressurser>` og `/api/v1/<ressurser>/:id`. Svar ligger under
  `/api/v1/questions/:id/answers` (liste og opprett) og `/api/v1/answers/:id`.
- Feil- og svarformen, kodene og lagdelingen er som i referansen
  (`{ ok, data }` / `{ ok: false, error: { code, message, fieldErrors } }`).
  Ikke «forbedre» dem. Kopier mønsteret, men ikke svakhetene (`as` på
  fetch-svar skal valideres med Zod).
- Answers-servicen spør questions-servicen, ikke dens repository.

## Kommandoer

Vi bruker **pnpm**. Ikke bruk npm, og ikke lag `package-lock.json`.

```bash
pnpm dev            # utviklingsserver, port 5173
pnpm lint           # tsc --noEmit
pnpm test           # vitest
pnpm generate       # etter hver endring i wrangler.jsonc
pnpm migrate:new    # lag migrasjon etter endring i schema
pnpm migrate:dev    # kjør migrasjoner lokalt
pnpm seed           # testdata
pnpm test:e2e       # Playwright
```

`allowBuilds` i `pnpm-workspace.yaml` (og `allowScripts` i `package.json`) sier
hvilke pakker som får kjøre installasjonsscript. Uten dem starter ikke
utviklingsserveren.
