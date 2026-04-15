# Copilot Instructions

## Commands

```bash
pnpm dev                  # Start dev server (mock mode: NEXT_PUBLIC_ENABLE_MOCK=enabled ENABLE_MOCK=enabled pnpm dev)
pnpm build                # Production build
pnpm lint                 # Run ESLint
pnpm test                 # Lint + vitest (watch mode)
pnpm test:ci              # Lint + vitest run (CI, no watch)
pnpm prettier             # Format src/**
pnpm test:e2e             # Playwright e2e tests (spins up dev server automatically)
pnpm test:e2e:install     # Install Playwright browsers (run once)
```

Run a single vitest file:

```bash
pnpm vitest run src/lib/skjema-state.test.ts
```

Run a single Playwright test:

```bash
pnpm playwright test e2e/fullfor-registrering.spec.ts
```

## Architecture

This is a **Next.js** app that uses **both the App Router (`src/app/`) and Pages Router (`src/pages/`)**. The app serves the job-seeker registration form (arbeidssøkerregistrering) at `/arbeid/registrering`.

### Routing

- `src/app/[lang]/` — App Router pages with i18n support. Languages: `nb` (default), `nn`, `en`. The `[lang]` segment is used only for `nn` and `en`; Norwegian bokmål uses the root path.
- `src/pages/` — Legacy Pages Router (index redirect, 404, error pages).
- The skjema (form) flows through numbered steps: `/opplysninger/start` → `/opplysninger/1` → `/opplysninger/2` → ... → `/opplysninger/kvittering`.

### Form state

Form state is managed via `useReducer` in `SkjemaStateContext` (`src/contexts/skjema-state-context.tsx`). Actions and the reducer are in `src/lib/skjema-state.ts`. Navigation between steps is computed by a state machine (`src/lib/standard-registrering-tilstandsmaskin.ts`) that determines `neste`/`forrige`/`fremdrift` based on current `SkjemaState`. The `SkjemaSide` enum in `src/model/skjema.ts` defines the step numbers.

### API routes (`src/app/api/`)

All API routes proxy requests to backend services. The helper `lagArbeidssokerApiKall` (`src/lib/lag-arbeidssoker-api-kall.ts`) handles:

- Mock mode bypass (when `NEXT_PUBLIC_ENABLE_MOCK=enabled`)
- TokenX OBO token exchange via `@navikt/oasis`
- Standard headers (`Nav-Consumer-Id`, `Nav-Call-Id`)

Backend client IDs are defined in `src/lib/next-api-handler.ts` (`AIA_BACKEND_CLIENT_ID`, `INNGANG_CLIENT_ID`, `OPPSLAG_V2_CLIENT_ID`).

### Auth

Tokens are validated in `src/auth/token-validation.ts` using `jose`. Supports both TokenX and ID-porten JWTs.

### Feature toggles

Unleash toggles are fetched via `/api/unleash` and consumed through `FeatureTogglesProvider`. Toggle keys are defined in `src/unleash-keys.ts`. In mock mode, all toggles return `true`.

### Language

`useSprak()` hook (`src/hooks/useSprak.tsx`) reads the `[lang]` URL param and falls back to `'nb'`. Language-aware text uses `@navikt/arbeidssokerregisteret-utils`.

## Key conventions

- **Mock mode**: Set `NEXT_PUBLIC_ENABLE_MOCK=enabled` and `ENABLE_MOCK=enabled` to run without NAIS/naisdevice. Playwright e2e tests always run in mock mode.
- **Path alias**: `@/` maps to `src/` (configured in both `tsconfig.json` and `vitest.config.ts`).
- **Design system**: Uses NAV's Aksel design system (`@navikt/ds-react`, `@navikt/aksel-icons`) and Tailwind via `@navikt/ds-tailwind`.
- **Logging**: Use `logger` from `@navikt/next-logger` (wraps pino) — not `console.log` — in API routes.
- **Nav decorator**: The NAV site header/footer is rendered server-side in `src/app/layout.tsx` via `fetchDecoratorReact`.
- **Norwegian naming**: Domain code (variables, functions, files) uses Norwegian. `sprak` = language, `skjema` = form, `opplysninger` = information/details, `veiledning` = guidance, `kvittering` = receipt/confirmation.
- **Deploy to dev only**: Prefix branch name with `dev/` to deploy only to the dev environment.
- **Test IDs**: GitHub packages registry requires a PAT with `read:packages` scope and SSO configured for NAVIKT.
