# AGENTS.md — poa-arbeidssokerregistrering

Denne filen er rettet mot AI-agenter (GitHub Copilot, Claude, Cursor, o.l.) som jobber i dette repoet. Den er selvforsynt — du trenger ikke lese andre filer for å forstå prosjektet.

## Prosjektoversikt

**poa-arbeidssokerregistrering** er arbeidssøkerregistreringen for innbyggere på nav.no. Appen lar brukere registrere seg som arbeidssøkere via et flertrinns skjema.

- **Stack:** Next.js 16, TypeScript, React 19, App Router
- **Designsystem:** Nav Aksel (`@navikt/ds-react`, `@navikt/aksel-icons`)
- **Auth:** ID-porten + Wonderwall (innbygger), TokenX for service-til-service
- **Plattform:** Nais/GCP, namespace `paw`, team `paw`
- **URL:** `/arbeid/registrering`
- **Repo:** [navikt/poa-arbeidssokerregistrering](https://github.com/navikt/poa-arbeidssokerregistrering)

## Oppsett

Krever Node.js >=24.22.1 og pnpm 11.28.6. Se `engines` og `packageManager` i `package.json`. `.nvmrc` og CI bruker Node.js 24.22.1.

Noen avhengigheter hentes fra GitHubs package registry. Du trenger et PAT med `read:packages`-scope og SSO konfigurert mot NAVIKT:

```bash
npm login --registry https://npm.pkg.github.com
# Bruk PAT som passord
```

Installer avhengigheter:

```bash
pnpm install
```

## Kommandoer

```bash
pnpm dev                  # Start dev-server (trenger naisdevice for backend-kall)
pnpm build                # Produksjonsbygg
pnpm lint                 # Kjører biome
pnpm test                 # Lint + vitest (watch-modus)
pnpm test:ci              # Lint + vitest run (CI, ingen watch)
pnpm format               # Formater src/** med biome
pnpm test:e2e             # Playwright e2e-tester (starter dev-server automatisk)
pnpm test:e2e:install     # Installer Playwright-nettlesere (kjøres én gang)
pnpm storybook            # Start Storybook for isolert komponentutvikling → http://localhost:6006
pnpm build-storybook      # Bygg Storybook til statiske filer
```

**Mock-modus** — kjør uten naisdevice:

```bash
NEXT_PUBLIC_ENABLE_MOCK=enabled ENABLE_MOCK=enabled pnpm dev
```

**Kjør én enkelt vitest-fil:**

```bash
pnpm vitest run src/lib/skjema-state.test.ts
```

**Kjør én enkelt Playwright-test:**

```bash
pnpm playwright test e2e/fullfor-registrering.spec.ts
```

## Arkitektur

### Routing

Appen bruker **App Router**:

- `src/app/` inneholder bokmålsrutene, redirects, 404 og feilsider. `src/pages/` finnes ikke.
- `src/app/[lang]/` inneholder språkvariantene `nn` og `en`. Bokmål (`nb`) er standard og bruker URL-er uten språksegment. Språkrutene gjenbruker sidekomponentene fra bokmålsrutene.
- Alle URL-er nedenfor er relative til base-path `/arbeid/registrering`.

### Skjemaflyt

Registreringen er et flertrinns skjema:

```
/start → /opplysninger/1 → /opplysninger/2 → /opplysninger/3 → /opplysninger/4 → /opplysninger/5 → /kvittering
```

`/start` sjekker om brukeren kan starte en arbeidssøkerperiode før skjemaet åpnes. `/opplysninger` videresender til `/start`.

De aktive skjemasidene tilsvarer disse `SkjemaSide`-enum-verdiene:

| Side | Innhold                        |
| ---- | ------------------------------ |
| 1    | Din situasjon (`DinSituasjon`) |
| 2    | Siste jobb                     |
| 3    | Utdanning                      |
| 4    | Hindringer                     |
| 5    | Oppsummering                   |

Brukeren fullfører registreringen fra oppsummeringen på side 5. `FullforRegistrering = '6'` finnes fortsatt i enumen, men inngår ikke i sidekartet eller tilstandsmaskinen.

### Oppdatering av opplysninger

`/oppdater-opplysninger` henter et snapshot av eksisterende opplysninger. Ved manglende eller avsluttet periode sendes brukeren til `/start`. Med eksisterende opplysninger åpnes oppsummeringen på `/oppdater-opplysninger/5`, ellers første skjemaside.

- `src/app/oppdater-opplysninger/api.ts` henter snapshot fra backend med TokenX.
- `src/app/oppdater-opplysninger/[side]/wrapper.tsx` initialiserer skjemastate med eksisterende opplysninger via `InitSkjema`.
- `src/app/oppdater-opplysninger/[side]/skjema.tsx` definerer oppdateringsskjemaet. Begge skjemaflytene bruker `src/components/skjema-side-factory.tsx`.

### Tilstandsmaskin og skjemastate

Skjemastatus styres via `useReducer` i `SkjemaStateContext`:

- **Context:** `src/contexts/skjema-state-context.tsx`
- **Reducer og actions:** `src/lib/skjema-state.ts`
- **Navigeringslogikk:** `src/lib/standard-registrering-tilstandsmaskin.ts` beregner `neste`/`forrige`/`fremdrift` ut fra brukerens svar. `ALDRI_HATT_JOBB` hopper over «Siste jobb», og `VIL_FORTSETTE_I_JOBB` hopper over «Utdanning».

### API-ruter (`src/app/api/`)

API-rutene omfatter backend-proxyer, health checks (`isalive`/`isready`), konfigurasjon og Unleash. Backend-rutene bruker flere hjelpere eller egne kall. Hjelpefunksjonen `lagArbeidssokerApiKall` (`src/lib/lag-arbeidssoker-api-kall.ts`) håndterer:

- Mock-modus bypass når `NEXT_PUBLIC_ENABLE_MOCK=enabled`
- TokenX OBO token exchange via `@navikt/oasis`
- Standard headers (`Nav-Consumer-Id`, `Nav-Call-Id`)

`src/lib/next-api-handler.ts` definerer felles headers, flere client IDs, `proxyRequestWithAuth` og en TokenX-hjelper for Aareg.

Serverkomponenter kaller også backend direkte. `src/app/start/api.ts` bruker `arbeidssokerApiKall` fra `src/lib/arbeidssoker-api-kall.ts`, som validerer innkommende token og utfører TokenX OBO token exchange. Snapshot-kallet i `src/app/oppdater-opplysninger/api.ts` har egen implementasjon.

### Auth

- **Innbygger:** ID-porten + Wonderwall (Nais-sidecar). `src/lib/arbeidssoker-api-kall.ts` bruker `src/auth/token-validation.ts` til JWT-validering med `jose`. Valideringsfunksjonen støtter både TokenX- og ID-porten-token. Ikke anta at alle API-ruter bruker denne funksjonen.
- **Service-til-service:** Brukerautentiserte backend-kall bruker TokenX OBO token exchange via `@navikt/oasis`.

### Feature toggles

Toggle-nøkler er definert i `src/unleash-keys.ts`. Serverfunksjonen `isEnabled` i `src/lib/unleash-is-enabled.ts` brukes blant annet på forsiden og veiledningssiden for brukere under 18 år. Den returnerer `true` i mock-modus (`ENABLE_MOCK=enabled`) og `false` ved feil fra Unleash.

`/api/unleash?toggle=...` bruker samme funksjon utenfor mock-modus og returnerer `true` for de forespurte nøklene i mock-modus. `FeatureTogglesProvider` i `src/contexts/feature-toggle-context.tsx` finnes fortsatt, men er ikke montert i root-layouten og har ingen brukere av hooken i appen.

`/api/features` er en separat rute for Unleash-definisjoner. Den bruker `NEXT_PUBLIC_ENABLE_MOCK`; mock-definisjonen setter `arbeidssoekerregistrering.redirect-forside` til `false`.

### Språk

`useSprak()`-hooken (`src/hooks/useSprak.tsx`) leser `[lang]`-URL-parameteren og faller tilbake til `'nb'`. Språkbevisste tekster bruker `@navikt/arbeidssokerregisteret-utils`.

## Sentrale filer

| Fil                                                | Formål                                                                        |
| -------------------------------------------------- | ----------------------------------------------------------------------------- |
| `src/model/skjema.ts`                              | `SkjemaSide`-enum og `SkjemaState`-type — start her for å forstå datamodellen |
| `src/lib/standard-registrering-tilstandsmaskin.ts` | Navigeringslogikk mellom skjemasider                                          |
| `src/lib/skjema-state.ts`                          | Reducer og actions for skjemastate                                            |
| `src/contexts/skjema-state-context.tsx`            | React context som wrapper hele skjemaet                                       |
| `src/lib/lag-arbeidssoker-api-kall.ts`             | API-hjelper med TokenX og mock-bypass                                         |
| `src/lib/arbeidssoker-api-kall.ts`                 | Backend-kall fra server med JWT-validering og TokenX                          |
| `src/lib/next-api-handler.ts`                      | Backend client IDs og felles API-handler                                      |
| `src/auth/token-validation.ts`                     | JWT-validering for ID-porten og TokenX                                        |
| `src/unleash-keys.ts`                              | Feature toggle-nøkler                                                         |
| `src/lib/unleash-is-enabled.ts`                    | Evaluering av feature toggles på serveren                                    |
| `src/components/skjema-side-factory.tsx`           | Felles visning og navigering for registrering og oppdatering                  |
| `src/app/oppdater-opplysninger/api.ts`             | Henting av eksisterende opplysninger fra snapshot-API-et                      |
| `src/app/layout.tsx`                               | Root layout med Nav-dekoratør (server-side)                                   |
| `.nais/dev-gcp/nais.yaml`                          | Nais-manifest for dev                                                         |
| `.nais/prod-gcp/nais.yaml`                         | Nais-manifest for prod                                                        |

## Konvensjoner

- **Norsk navngiving:** Domenekode (variabler, funksjoner, filer) bruker norsk. `sprak` = language, `skjema` = form, `opplysninger` = information, `veiledning` = guidance, `kvittering` = receipt.
- **Path alias:** `@/` peker på `src/` (konfigurert i `tsconfig.json` og `vitest.config.mts`).
- **Designsystem:** Bruk alltid Aksel-komponenter fra `@navikt/ds-react`. Ikke lag egne UI-komponenter.
- **Logging:** Bruk `logger` fra `@navikt/next-logger` i API-ruter — aldri `console.log`.
- **Nav-dekoratør:** Hentes server-side i `src/app/layout.tsx` via `fetchDecoratorReact`.
- **Deploy til dev:** Prefiks branch-navn med `dev/` for å deploye kun til dev-miljøet.
- **Formatering og lint:** Biome, konfigurert i `biome.json`, med `lineWidth: 120`, `indentWidth: 4` og `quoteStyle: 'single'`. `pnpm lint` kjører `biome check ./src`.
- **Storybook-stories:** Legg stories i samme mappe som komponenten (`komponent.stories.tsx`). Typer importeres fra `@storybook/nextjs`, test-utils (`fn`) fra `storybook/test`. Språk styres av `globals.sprak`, for eksempel `globals: { sprak: 'nn' }` på en story, eller språkvelgeren i verktøylinjen. Dekoratøren i `.storybook/preview.tsx` setter `useParams` fra denne globalen.

## Teststrategi og sikkerhetsnett

Tester er det primære sikkerhetsnettet i dette repoet. Kjør relevante tester etter alle endringer.

### Enhetstester (vitest) — `src/lib/`

| Testfil                                         | Dekker                                 |
| ----------------------------------------------- | -------------------------------------- |
| `standard-registrering-tilstandsmaskin.test.ts` | Navigeringslogikk mellom sider         |
| `skjema-state.test.ts`                          | Reducer og state-transitions           |
| `bygg-fullfor-registrering-payload.test.ts`     | Payload til fullføring av registrering |
| `bygg-opplysninger-payload.test.ts`             | Payload til opplysninger-endepunkt     |
| `har-aktiv-arbeidssoker-periode.test.ts`        | Sjekk av aktiv periode                 |
| `hent-kvitterings-url.test.ts`                  | URL-logikk for kvittering              |
| `hent-siste-arbeidsforhold.test.ts`             | Henting av arbeidsforhold              |
| `personident-til-alder.test.ts`                 | Aldersberegning fra personident        |
| `vis-utdanningsvalg.test.ts`                    | Visningslogikk for utdanningsvalg      |
| `til-sprak-url.test.ts`                        | Språktilpasning av interne og eksterne URL-er |

API-ruten `/api/unleash` har egne tester i `src/app/api/unleash/route.test.ts`.

### E2E-tester (Playwright) — `e2e/`

- `fullfor-registrering.spec.ts` — happy-path gjennom hele registreringsflyten i mock-modus.
- Playwright starter appen automatisk med mock-flagg via `playwright.config.ts`.

### Testguide per endringstype

| Du endrer                                  | Kjør dette                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| Skjemalogikk / navigering                  | `pnpm test:ci` + `pnpm test:e2e`                                        |
| `standard-registrering-tilstandsmaskin.ts` | `pnpm vitest run src/lib/standard-registrering-tilstandsmaskin.test.ts` |
| `skjema-state.ts`                          | `pnpm vitest run src/lib/skjema-state.test.ts`                          |
| API-ruter (`src/app/api/`)                 | `pnpm test:ci`                                                          |
| UI-komponenter                             | `pnpm test:e2e` + sjekk i `pnpm storybook`                              |
| Stories (`*.stories.tsx`)                  | `pnpm storybook`                                                        |
| Alt annet                                  | `pnpm test:ci`                                                          |

## Hva agenter bør gjøre

- **Kjør alltid `pnpm test:ci`** etter endringer. Kommandoen kjører Biome og alle Vitest-tester.
- **Kjør `pnpm test:e2e`** etter endringer i skjemaflyt eller UI-komponenter.
- **Bruk mock-modus** for lokal testing (`NEXT_PUBLIC_ENABLE_MOCK=enabled ENABLE_MOCK=enabled`).
- **Bruk norsk navngiving** for nye domenekonsepter, i tråd med eksisterende kode.
- **Bruk Aksel-komponenter** — ikke introduser egne UI-primitiver.
- **Følg eksisterende mønstre** i `src/lib/` for ny forretningslogikk.
- **Start med å lese `src/model/skjema.ts`** for å forstå datamodellen før du endrer skjemalogikk.
- **Bruk `dev/`-prefix** på branch-navn for å teste i dev uten å berøre prod.

## Hva agenter bør unngå

- **Ikke logg PII** — fnr, navn, adresse eller andre personopplysninger skal aldri logges. Logg sakId eller tekniske IDer.
- **Ikke endre `src/auth/token-validation.ts`** uten eksplisitt forespørsel — auth-logikken er sikkerhetskritisk og krever manuell gjennomgang.
- **Ikke endre Nais-manifest** (`.nais/`) uten at det er eksplisitt bedt om. Feil her kan gi nedetid eller brutt tilgangsstyring.
- **Ikke introduser nye npm-pakker** uten å avklare med teamet.
- **Ikke bruk `console.log`** i API-ruter — bruk alltid `logger` fra `@navikt/next-logger`.
- **Ikke generer egne UI-komponenter** — bruk Aksel.

## Agents og verktøy

| Agent/verktøy                   | Bruk når                                                                                                                                |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **nav-pilot**                   | Planlegging og arkitektur for nye features, migrasjoner eller større refaktoreringer. Spør nav-pilot _før_ du begynner å kode noe nytt. |
| **GitHub Copilot coding agent** | Autonome kodingsoppgaver basert på issues.                                                                                              |

## Bakgrunnsinformasjon

- [Next.js-dokumentasjon](https://nextjs.org/)
- [Nav Aksel designsystem](https://aksel.nav.no/)
- [Nais-dokumentasjon](https://doc.nais.io/)
- Testbrukere opprettes i [Dolly](https://dolly.ekstern.dev.nav.no/) for dev-miljøet.
- Dev-miljøet nås på [ansatt.dev.nav.no/arbeid/registrering](https://www.ansatt.dev.nav.no/arbeid/registrering).
- Spørsmål? Slack: [#team-paw-dev](https://nav-it.slack.com/archives/CLTFAEW75)
