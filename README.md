# yngre

Et spørsmål-og-svar-forum i stil med ung.no. Brukere stiller spørsmål, og en
admin svarer. Alle kan lese spørsmål og svar, men du må logge inn for å stille
spørsmål. Bygget med RedwoodSDK på Cloudflare Workers, med D1 og Drizzle som
database.

Selve appen ligger i mappa `starter/`. Alle kommandoene under kjøres derfra.

## Hovedflyten

1. Logg inn som **Test Testesen** (vanlig bruker) og still et spørsmål på forsiden.
2. Logg ut, og logg inn som **Admin Adminsen** (admin).
3. Åpne «Ubesvarte spørsmål» i menyen, velg spørsmålet og skriv et svar.
4. Alle, også de som ikke er innlogget, ser spørsmålet og svaret på `/questions/:id`.

En bruker kan også slette sitt eget spørsmål, og admin kan slette et svar.

## Kom i gang

Krever Node.js 22.12 eller nyere og pnpm.

```bash
cd starter
pnpm install
pnpm migrate:dev    # lager tabellene i den lokale databasen
pnpm seed           # legger inn to brukere, ett spørsmål og ett svar
pnpm dev            # starter appen på http://localhost:5173
```

Innloggingen er en nedtrekksliste: velg en bruker, uten passord.

## Kjøre testene

Fra `starter/`:

```bash
pnpm test             # alle testene, én gang
pnpm test:coverage    # samme, med dekningsrapport (havner i coverage/)
pnpm lint             # typesjekk med tsc
```

Hva testene dekker:

| Test                          | Hva den sjekker                                               |
| ----------------------------- | ------------------------------------------------------------- |
| `validate-question.test.ts`   | Reglene for tittel og innhold (enhetstest)                    |
| `question-service.test.ts`    | Innlogging, at `userId` skjules, og at bare eieren kan slette |
| `main-flow.test.ts`           | Hovedflyten: bruker spør, admin svarer, alle ser svaret       |
| `CreateQuestionForm.test.tsx` | Skjemaet viser feilmelding og beholder teksten                |

Servicetestene og hovedflyt-testen bruker en database i minnet med de ekte
migrasjonene (`starter/src/test/create-test-db.ts`).

## Hvor du finner hva

```
starter/src/
├─ worker.tsx                   inngangspunktet: middleware, API-ruter og sider
├─ features/
│  ├─ questions/                spørsmål
│  │  ├─ question-routes.ts       API-ruter (URL og metode)
│  │  ├─ question-controller.ts   leser request, svarer med riktig statuskode
│  │  ├─ question-service.ts      reglene: validering, innlogging, eierskap
│  │  ├─ question-repository.ts   eneste stedet som snakker med databasen
│  │  ├─ question-mapper.ts       database-rad til DTO (det klienten får se)
│  │  ├─ question-schema.ts       Zod: formen på input
│  │  ├─ actions.ts               server actions: opprette og slette spørsmål
│  │  ├─ components/              skjemaer og listen med spørsmål
│  │  ├─ pages/                   forsiden og spørsmålssiden
│  │  └─ utils/validate-question.ts  regler for tittel og innhold
│  ├─ answers/                  svar, samme oppbygging som questions
│  │  ├─ answer-routes.ts         API-ruter (bare admin kan skrive)
│  │  ├─ answer-controller.ts     leser request, svarer med riktig statuskode
│  │  ├─ answer-service.ts        reglene: admin, spørsmålet finnes, ett svar
│  │  ├─ answer-repository.ts     eneste stedet som snakker med databasen
│  │  ├─ answer-mapper.ts         database-rad til DTO (uten adminId)
│  │  ├─ answer-schema.ts         Zod: formen på input
│  │  ├─ actions.ts               server actions: opprette og slette svar
│  │  ├─ components/              svarskjema, slett-knapp og svardelen av siden
│  │  ├─ pages/AdminPage.tsx      admin-visningen med ubesvarte spørsmål
│  │  └─ utils/validate-answer.ts regler for svaret (ikke tomt, ikke for langt)
│  └─ auth/                     innlogging, sesjon og guards (middleware.ts)
├─ db/                          tabellene, relasjonene og seed
├─ components/Layout.tsx        header og footer rundt alle sider
├─ lib/shared/result.ts         Result-typen som alle lagene bruker
├─ app/styles.css               samler CSS-filene i app/styles/
└─ test/                        hjelpere for testene
```

### Sider og API

| Hva                               | Sti                            | Hvem                                    |
| --------------------------------- | ------------------------------ | --------------------------------------- |
| Forside med spørsmål og skjema    | `/`                            | alle leser, innloggede skriver          |
| Ett spørsmål med svar             | `/questions/:id`               | alle                                    |
| Ubesvarte spørsmål                | `/admin`                       | bare admin                              |
| Innlogging og profil              | `/login`, `/profile`           | `/profile` krever innlogging            |
| Spørsmål (GET, POST)              | `/api/v1/questions`            | lesing åpen, skriving krever innlogging |
| Ett spørsmål (GET, PATCH, DELETE) | `/api/v1/questions/:id`        | samme                                   |
| Svar (GET, POST, PATCH, DELETE)   | `/api/v1/questions/:id/answer` | lesing åpen, skriving bare admin        |

### Datalaget

Tre tabeller i `starter/src/db/schema/`: `users` (med rolle `user` eller
`admin`), `questions` (eies av en bruker) og `answers`. Et spørsmål har max
ett svar, så `answers.questionId` er unik. Slettes et spørsmål, slettes svaret
også.

## Valgene som preger koden

1. **Servicen eier reglene.** Forespørselen går routes, controller, service,
   repository. REST-API-et og server actions bruker den samme servicen, så
   innlogging og eierskap sjekkes ett sted. Det er viktig fordi en server action
   går utenom guards på API-rutene.
2. **Typer over grensene.** Alt som kommer utenfra valideres med Zod. Det som
   går ut, er en DTO uten interne felt (`userId` og `adminId` sendes aldri ut,
   i stedet finnes `isOwner`). Lagene svarer med `{ ok, data }` eller
   `{ ok: false, error }` i stedet for å kaste feil.
3. **Forenklet innlogging.** Vi valgte å bruke forenklet rollestyring som innlogging, slik det ble vist i forelesning. Vi valgte bort better auth for å gjøre det simplere for oss, og så vi slipper å sette oss inn i mye dokumentasjon. Ved å bruke den forenklede innloggingen, får vi det som kreves til en demo av appen. I en ekte app ville vi brukt e-post og passord, og en signert cookie eller en sesjon i databasen.
