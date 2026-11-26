# Integritetstesting av innsendingen

Dette dokumentet beskriver testene som viser at registreringen sender det brukeren har svart, uendret videre til backend. Testene viser også at innsendingen alltid starter en arbeidssøkerperiode, og at koden ikke behandler enkeltpersoner ulikt. Dokumentet er laget for internkontroll.

## Hva testene skal bevise

1. Innsendingen starter alltid en arbeidssøkerperiode før opplysningene sendes.
2. Svarene i skjemaet havner i kallet til backend slik brukeren ga dem.
3. Identiteten i kallet kommer fra innloggingen (ID-porten-tokenet), ikke fra nettleseren.
4. Koden har ingen unntak eller særbehandling for enkeltpersoner.
5. Brukeren får kvittering bare når backend har tatt imot både start av periode og opplysninger.

## Dataflyt

Når brukeren trykker «Fullfør registrering» på oppsummeringssiden, sender nettleseren to kall etter hverandre fra `src/components/skjema/fullfor-registrering-knapp-ny-inngang.tsx`:

| Rekkefølge | Kall fra nettleseren | Videresendes til inngang-API-et |
| --- | --- | --- |
| 1 | `PUT /api/start-arbeidssokerperiode-v2` uten kropp | `PUT /api/v2/arbeidssoker/periode` |
| 2 | `POST /api/opplysninger` med svarene fra skjemaet | `POST /api/v1/arbeidssoker/opplysninger` |

Feiler kall 1, sendes ikke kall 2. Feiler ett av kallene, får brukeren feilsiden og ingen kvittering.

Svarene gjøres om til payload i `src/lib/bygg-opplysninger-payload.ts`. Begge API-rutene sender videre via `src/lib/lag-arbeidssoker-api-kall.ts`, som:

- veksler innloggingen til et TokenX-token for inngang-API-et
- setter `identitetsnummer` fra `pid` i ID-porten-tokenet
- setter `periodeTilstand: 'STARTET'` på start-kallet
- avviser kallet med 401 hvis tokenet mangler identitet

Felt som serveren setter, overstyrer alltid felt med samme navn i kroppen fra nettleseren.

## Kontrollpunkter og tester

| Kontrollpunkt | Test |
| --- | --- |
| Start-kallet går til riktig endepunkt med `{ identitetsnummer, periodeTilstand: 'STARTET' }` | `src/lib/lag-arbeidssoker-api-kall.test.ts`: «sender PUT til inngang med periodeTilstand STARTET og identitet fra token» |
| Nettleseren kan ikke endre identitet eller periodetilstand | samme fil: «klienten kan ikke overstyre identitetsnummer eller periodeTilstand» og «klienten kan ikke overstyre identitetsnummer» |
| Kall uten identitet i tokenet stoppes | samme fil: «avviser med 401 og sender ingenting når token mangler identitet» |
| Ulike personer får likt kall (fødselsnummer, d-nummer, syntetisk nummer, under 18 år, over 67 år) | samme fil: «gir likt kall for alle personer» |
| Opplysningene videresendes uendret | samme fil: «videresender brukerens opplysninger uendret med identitet fra token» |
| Feil fra TokenX eller backend gir aldri svar om suksess | samme fil: «melder ikke suksess når backend avviser» og «melder ikke suksess når TokenX-veksling feiler» |
| Hvert svaralternativ i skjemaet havner riktig i payloaden | `src/lib/bygg-opplysninger-payload.test.ts`: blokken «integritet: svar i skjemaet havner i payloaden» |
| Alle situasjonsvalg er dekket av testene | samme blokk: «alle situasjoner i skjemaet er dekket av testene over» |
| Payloaden inneholder bare opplysninger, ikke identitet | samme blokk: «payloaden inneholder bare opplysningsfelt, ingen identitet» |
| Ingen hardkodede personnummer eller forgrening på identitet i koden | `src/lib/ingen-person-unntak.test.ts` |
| Hele flyten i nettleseren sender det brukeren valgte, i riktig rekkefølge | `e2e/innsending-integritet.spec.ts`: «sender nøyaktig de svarene brukeren valgte, etter at perioden er startet» |
| Opplysninger sendes ikke når start av periode feiler | samme fil: «sender ikke opplysninger og viser ikke kvittering når start av periode feiler» |
| Ingen kvittering når opplysningene ikke blir tatt imot | samme fil: «viser ikke kvittering når innsending av opplysninger feiler» |

## Den statiske vakten

`src/lib/ingen-person-unntak.test.ts` leser alle kildefiler i `src/`, unntatt tester, stories og mockdata. Testen feiler hvis den finner:

- et hardkodet 11-sifret nummer i en streng
- en sammenligning (`===`, `!==`, `==`, `!=`) mot `pid`, `identitetsnummer`, `personident`, `fnr`, `dnr` eller `ident`
- `switch` på en identitet
- oppslag eller mønstersjekk på en identitet, for eksempel `.includes(pid)` eller `pid.startsWith(...)`

Testen sjekker også at den selv oppdager slike mønstre, slik at vakten ikke kan bli virkningsløs uten at noen merker det.

Filer med en legitim grunn til å lese innholdet i identiteten står i `GODKJENTE_FILER` i testen, med begrunnelse. I dag gjelder det bare `src/lib/personident-til-alder.ts`, som regner ut alder for å vise veiledning til brukere under 18 år. Aldersberegningen endrer ikke hva som sendes til backend. Nye filer i listen skal begrunnes i pull requesten og godkjennes av teamet.

## Endringslogg

**November 2026: identitet og periodetilstand kunne overstyres fra nettleseren.**
`lag-arbeidssoker-api-kall.ts` la kroppen fra nettleseren sist da kallet ble bygget. Et håndlaget kall kunne dermed sende med et annet `identitetsnummer` eller en annen `periodeTilstand`, og verdien gikk uendret videre til inngang-API-et. Rekkefølgen er nå snudd, slik at verdier fra serveren alltid vinner. Kropper som ikke er objekter, blir ignorert, og kall uten identitet i tokenet avvises med 401. Testene i `lag-arbeidssoker-api-kall.test.ts` feiler mot den gamle koden.

## Slik kjører du testene

```bash
pnpm test:ci                                             # Biome og alle Vitest-tester
pnpm vitest run src/lib/lag-arbeidssoker-api-kall.test.ts
pnpm vitest run src/lib/bygg-opplysninger-payload.test.ts
pnpm vitest run src/lib/ingen-person-unntak.test.ts
pnpm playwright test e2e/innsending-integritet.spec.ts   # Krever pnpm test:e2e:install første gang
```

Vitest-testene kjører i CI med `pnpm test:ci`. Playwright-testen kjører med mock-modus og trenger ikke naisdevice.

## Avgrensninger

- Testene viser hva frontenden sender. Hva inngang-API-et gjør med dataene, må dokumenteres i backend-teamets egne tester.
- Den statiske vakten finner mønstrene beskrevet over. Den erstatter ikke kodegjennomgang, men gjør det vanskelig å legge inn et unntak for en person uten at testen feiler.
- E2E-testen bruker mockdata for siste jobb. Den sjekker derfor at stillingsfeltene sendes, mens nøyaktig mapping av stilling er dekket av enhetstestene.
