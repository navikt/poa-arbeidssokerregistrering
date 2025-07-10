# poa-arbeidssokerregistrering

Arbeidssøkerregistrering for personbruker.

# Utvikling

Bruk Node.js 22 `nvm use` (dersom du bruker nvm til versjonshåndtering av Node.js).

Dersom du ikke kjører i mock-modus må du ha koblet til [naisdevice](https://doc.nais.io/device/) for å nå noen av endepunktene.

Siden noen av modulene hentes fra GitHubs package registry må du også gjøre litt ekstra konfigurasjon for å kjøre løsningen lokalt.

- Opprett et PAT (github => settings => developer settings => personal access tokens => tokens (classic)) med `read:packages` scope
- Konfigurer SSO mot NAVIKT for tokenet
- bruk tokenet som passord ved login `npm login --registry https://npm.pkg.github.com`

Deretter fortsette du med

- klon repo
- innstaller avhengigheter `npm i`
- kjør tester `npm t`
- start utviklingsserver `npm run dev`
- åpne nettleseren på `http://localhost:3000/arbeid/registrering`

Dette er en Next.js løsning som har levd en stund. Den bruker derfor både app og pages.

## Deploye kun til dev

Ved å prefikse branch-navn med `dev/`, så vil branchen kun deployes i dev.

```
git checkout -b dev/<navn på branch>
```

For å teste løsningen i dev bruker du [https://www.ansatt.dev.nav.no/arbeid/registrering](https://www.ansatt.dev.nav.no/arbeid/registrering)

Du oppretter testbrukere du ønsker å registrere i Dolly [https://dolly.ekstern.dev.nav.no/](https://dolly.ekstern.dev.nav.no/)

## Ekstern dokumentasjon

- [Next.js](https://nextjs.org/)
- [testing-library](https://testing-library.com/)
- [Tailwind CSS](https://tailwindcss.com/)

# Henvendelser

Spørsmål knyttet til koden eller prosjektet kan stilles via issues her på github.

# For NAV-ansatte

Interne henvendelser kan sendes via Slack i kanalen [#team-paw-dev](https://nav-it.slack.com/archives/CLTFAEW75)
