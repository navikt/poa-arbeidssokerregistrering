# UU-testing

## Status og avgrensning

Utvikleren har bekreftet at alle lokale testkjøringer er grønne. CI-oppsettet er kontrollert statisk, men ikke kjørt i GitHub Actions ennå. Typekontroll og enhetstester supplerer nettlesertestene, men erstatter dem ikke. Testene skal synliggjøre avvik, ikke godta dem for å få en grønn kjøring.

En grønn testkjøring er ikke en bekreftelse på at appen oppfyller WCAG. Automatisk testing må kombineres med manuell vurdering og testing med hjelpemidler.

## Kjør lokalt

Bruk Node.js-versjonen fra `.nvmrc` og repoets pnpm-versjon:

```bash
source "$HOME/.nvm/nvm.sh"
nvm use
pnpm test:ci
pnpm test:uu
pnpm test:uu:komponenter
pnpm test:dekorator
```

Kjør kommandoene etter hverandre. Apptestene og dekoratørtesten starter server på port 3000. Komponenttestene starter Storybook på port 6006. Testene gjenbruker ikke en eksisterende server, slik at feil miljø ikke gir et misvisende resultat. De bruker syntetiske data og eksisterende mock-backend.

Trace, skjermbilder og video kan inneholde skjemaets svar. Ikke kjør disse testene med ekte personopplysninger. Axe-rapportene ligger som JSON-vedlegg i testresultatene og inneholder hele skanningen, tilstandsnavnet og motorversjonen.

`pnpm test:uu` kjører apptestene med `@uu` i test- eller suitenavnet. `pnpm test:e2e` kjører disse og den eksisterende happy-path-testen. Komponenttestene bruker en egen konfigurasjon og inngår bare i `pnpm test:uu:komponenter`. Dekoratørens smoke-test er separat.

## CI/CD

`.github/workflows/deploy.yml` kjører testene ved push til `main` og `dev/*`. Disse jobbene kjører i parallell:

| Jobb | Innhold |
| --- | --- |
| `test` | Lint, enhetstester og Knip. |
| `e2e` | Hele appens Playwright-suite, inkludert UU og happy-path. Fire shards kjører på separate runners med én worker hver. |
| `uu-komponenter` | Storybook-testene, med én worker på egen runner. |
| `dekorator-smoke` | Smoke-test mot ekte dekoratør, med én worker på egen runner. |

`build` venter på alle fire testjobbene. Hvis én shard eller en annen obligatorisk testjobb feiler, starter ikke produksjonsbygg, CDN-opplasting eller image-publisering. Deploy-jobbene beholder eksisterende branch-regler og avhengigheter, og er dermed også blokkert av testene. Appens UU-tester kjøres ikke en ekstra gang som egen jobb.

Shardene fordeler enkelttester fordi `fullyParallel` er aktivert. Dagens 192 appkjøringer fordeles med 48 på hver shard. Installasjon og serveroppstart skjer på hver runner, så CI-tiden må måles før antallet shards justeres. `fail-fast: false` lar alle shardene fullføre og rapportere funn hvis én feiler.

Testjobbene bruker eksplisitte, syntetiske URL-er for offentlig appkonfigurasjon. Disse verdiene er ikke satt i byggjobben og endrer ikke produksjonskonfigurasjonen. GitHub-secreten `READER_TOKEN` brukes bare under pakkeinstallasjonen. Chromium og nødvendige Linux-pakker installeres med `playwright install --with-deps chromium`.

Testjobbene laster opp blob-rapporter og tilgjengelige feilvedlegg, også når testene feiler. `playwright-rapport` samler blob-rapportene til artefakten `playwright-html-rapport`. Last ned hele rapportmappen for å åpne rapporten med vedlegg. Artefakter beholdes i sju dager. Rapportjobben kan ikke slippe gjennom et bygg når testene har feilet.

Dekoratørens smoke-test er en obligatorisk byggbetingelse. Nedetid i dekoratøren kan derfor stoppe løpet selv om appens isolerte tester består. Dette vises som en separat jobb og skal ikke skjules som et bestått resultat.

En pågående kjøring avbrytes ikke av en ny push på samme branch. GitHub kan erstatte en eldre ventende kjøring med en nyere push. Dette hindrer at en ny push avbryter en pågående deploy.

## Hva testes automatisk nå?

| Test | Hva kontrolleres? | Hva beviser den ikke? |
| --- | --- | --- |
| `e2e/fullfor-registrering.spec.ts` | Registrering fra `/start` gjennom fem skjemasteg til kvittering, valgt svar, forventede URL-er og ubehandlede JavaScript-feil gjennom registreringen. Kjøres i Chromium med desktop-bredde og 320 CSS-piksler. | Tastaturbetjening, skjermleseropplevelse, kontrast og fravær av avklipping. Testen bruker fortsatt museklikk. |
| `e2e/uu-skjemaflyt.spec.ts` | Registrering på bokmål, nynorsk og engelsk, tastaturbetjening, struktur, språk, sidetitler og fokus. Axe-skanning av skjemasteg og kvittering. Egne tester for hopp over siste jobb eller utdanning, underspørsmål og radiogruppe for tidligere jobb. | At alle kombinasjoner av svar er brukervennlige, eller at skjermleseren formidler innholdet godt. |
| `e2e/uu-oppdatering.spec.ts` | Oppsummering og tastaturredigering av de fire seksjonene på tre språk. Endrede svar beholdes. Reflow og tekstavstand på oppsummering og utdanning. Innsending og avbrudd til konfigurert destinasjon fanges lokalt. | Innhold eller UU i appen det videresendes til. |
| `e2e/uu-interaksjon.spec.ts` | Manglende svar, feiloppsummering, lenker til feilfelter og retting av feil. Stillingssøk med piltaster, Enter og Escape, inkludert fallback når søket ikke har treff. Avbryt-dialog med navn, fokusfelle og retur av fokus. Axe-skanning av åpne og ugyldige tilstander. | Faktisk opplesning av feil og søkeforslag. Fokuskontrast og om hele fokusindikatoren er synlig. |
| `e2e/uu-innsending.spec.ts` | Lastende og deaktivert innsendingsknapp, tilgjengelig navn, kvittering og teknisk feil fra hvert av registreringens to API-kall. Kontrollert forsinkelse brukes i stedet for fast ventetid. | Driftssituasjoner og sesjonsutløp mot ekte backend. |
| `e2e/uu-sider.spec.ts` | Feilsider, veiledning, begge kvitteringsvariantene, 404 og mockforsiden på tilgjengelige språk. Separate tester for axe, reflow ved 320 CSS-piksler og økt tekstavstand. | Språklig kvalitet eller full lesbarhet ved zoom og skjermleserbruk. Mockforsiden er ikke den eksterne innbyggerforsiden på nav.no. |
| `e2e/uu-komponenter.storybook.ts` | Tre under-18-varianter i Storybook på bokmål, nynorsk og engelsk: oppgave opprettet, allerede bedt om kontakt og teknisk feil. Axe, reflow og tekstavstand testes i et komponentharness med hovedinnhold. | Serverens valg av variant, oppgaveoppretting eller appens landemerker og språkinnstilling. Harnessets `main` og `lang` er testoppsett, ikke bevis på sidens UU. |
| `src/lib/dekorator-testmiljo.test.ts` | Avgrensning av den lokale dekoratørstubben, CSP-tillegget og skille mellom apptester og smoke-miljø. | UU eller korrekt produksjons-CSP i nettleseren. |
| `src/lib/skjema-sidetitler.test.ts` og `src/components/kvittering/ny-kvittering.test.tsx` | Serverlayoutenes metadata på tre språk, fallback for ukjent side og stabil første rendring av kvitteringen før `sessionStorage` leses. | Endelig sidetittel, layout eller navigeringsfokus i nettleseren. |
| `src/components/skjema/siste-jobb/stillings-sok-v2.test.tsx` og `src/components/skjema/oppsummering/SvarOppsummering.test.tsx` | Stillingsvalg og fallback beholder eksisterende svarobjekt, Escape avbryter, forespørsler avbrytes ved avmontering og søkefelt har unike ID-er. Tomme svar lager ikke oppsummeringsseksjoner. | Full tastatur- og skjermleseropplevelse i nettleseren eller faktisk layout. |
| `src/app/oppdater-opplysninger/page.test.tsx` og `src/components/feilmeldinger/kan-ikke-starte-periode-v2.test.tsx` | Navigeringsvalg ved manglende eller avsluttet periode, manglende opplysninger og avvisninger eller tekniske feil. | Rendret innhold, nettlesernavigering eller at den faste E2E-mocken kan nå alle disse tilstandene. |
| `e2e/dekorator.smoke.spec.ts` | Feilsiden har synlig H1, dekoratørens header og footer er synlige, og teststubbens markører mangler. | Dekoratørens cookie-banner, hopp-lenke, språkvelger eller innloggingsfunksjoner. |

## Hva betyr sjekkene?

Axe 4.14.0 kjøres med WCAG 2.1 A/AA, tilgjengelige WCAG 2.2 AA-regler og best-practice-regler. `target-size` er slått på eksplisitt, siden denne regelen er av som standard i motoren. Ingen WCAG 2.2 A-tag finnes i den installerte motorversjonen. Testene slår ikke av regler eller utelater appinnhold for å skjule funn.

`violations` gjør testen rød. Resultater under `incomplete` krever manuell vurdering. De er ikke bekreftede feil eller bekreftede passeringer. Kontroller særlig kontrast og målstørrelse i rapportene. `inapplicable` betyr at regelen ikke var relevant for den skannede tilstanden, ikke at den er dekket på hele nettstedet.

Tastaturtestene bruker Tab, Shift+Tab, piltaster, Space og Enter. Stegfokus kontrolleres ved første åpning og etter navigering. En vanlig tilstandssjekk krever ikke fokus på overskriften etter at brukeren har valgt et svar. Feiltester kontrollerer både synlig feilmelding, ugyldig-status og beskrivelseskobling på gruppen eller alle feltene.

Stillingsvalget bruker `UNSAFE_Combobox` fra installert Aksel 8.20. Testene kontrollerer fokus og ARIA-tilstand på tekstfeltet, samt virtuelt fokus på forslagene. Serverens stillingsobjekt beholdes når et forslag velges. Utdanningssiden viser tre spørsmål før nivå er valgt; ved «Ingen utdanning» skjules underspørsmålene. Testene følger denne eksisterende regelen.

Aksel 8.20 gir ikke den interne listeboksen et tilgjengelig navn. En avgrenset korreksjon bruker inputens `aria-controls` for å finne bare dens egen listeboks og sette samme navn som søkefeltet. Ingen roller endres. Kontroller om korreksjonen fortsatt trengs ved en senere Aksel-oppgradering.

Reflow-sjekken måler horisontal overflow og avklipping av kontroller og etiketter ved 320 CSS-piksler. Tekstavstandssjekken setter linjeavstand til 1,5, bokstavavstand til 0,12 em, ordavstand til 0,16 em og avsnittsavstand til 2 em via stilegenskaper på elementene. Den kontrollerer at verdiene er brukt og ser etter overflow og avklipping. Dette er delvise kontroller. Du må også vurdere overlapp, all tekstklipping og reell 200 %/400 % zoom manuelt.

Geometrisjekken har ett avgrenset unntak: Aksels tomme, ikke-interaktive `.aksel-progress-bar__foreground` under en fremdriftsindikator med `aria-hidden="true"`. Fyllflaten flyttes utenfor rammen og klippes med vilje. Dette er ikke tapt tekst eller en tildekket kontroll. Unntaket gjelder ikke axe-skanningen eller andre elementer. Når en modal er åpen, måles tekst og kontroller i selve dialogen, ikke i den låste bakgrunnssiden. Dokumentets horisontale overflow kontrolleres fortsatt.

Ventetilstandstesten finner innsendingsknappen via test-ID. Aksel skjuler den synlige knappeteksten under lasting og gir spinneren navnet «Venter…». Testen kontrollerer handlingens navn før innsending, samt deaktivert tilstand og tilgjengelig ventenavn under innsending. Den slipper og fullfører det forsinkede API-kallet før testkonteksten lukkes.

Fokussjekken kontrollerer en beregnet outline eller skygge og noen punkter på kontrollen som ikke er tildekket. Den beviser ikke at indikatoren skiller seg tydelig fra normaltilstanden, har tilstrekkelig kontrast eller er synlig i sin helhet. Disse forholdene inngår i den manuelle guiden.

## Egen CSP for apptestene

Apptestene starter `next dev --webpack` med en lokal dekoratørstub. Utviklingsbygget trenger JavaScript-evaluering, så stubben legger til `script-src 'self' 'unsafe-eval'`. Den endrer ikke `next.config.js` eller produksjonens policy. Dette er en testavgrensning, ikke en kontroll av produksjons-CSP.

Apptestene bruker også en klientfixture som setter dekoratørdata og svarer på dekoratørklientens ready-meldinger før appen starter. Fixturen gir ikke samtykke til statistikk eller undersøkelser. Den viser ikke cookie-banner og brukes ikke av smoke-testen. Testen venter på stegfokus ved navigering, slik at native HTML-kontroller ikke betjenes før React har startet.

Klientfixturen filtrerer kodeoppdateringer på den lokale utviklingsserverens WebSocket for `/_next/hmr` (Next 16.4) og det eldre `/_next/webpack-hmr`. Next 16.4 bruker også kanalen til Reacts debug-strømmer for asynkrone serverkomponenter. Derfor videresendes oppstartsdata, binære strømmer, feil og ukjente meldinger uendret. Første vellykkede `sync` videresendes per forbindelse. Senere vellykkede `sync`-meldinger filtreres fordi nye kompileringshasher kan få Next til å laste siden på nytt. Kjente kodeoppdateringer filtreres også. Kompileringsmeldinger med feil videresendes fortsatt. Dette skillet kontrolleres i `src/lib/uu-hmr.test.ts`. Vanlig navigering, API-kall og kontrollen av JavaScript-feil er beholdt. Andre WebSocket-kanaler omfattes ikke av filteret.

Apptestene krever tilgang til `https://cdn.nav.no/aksel/fonts/SourceSans3-normal.woff2`, som er appens faktiske font. Klientfixturen tillater bare GET til denne eksakte font-URL-en i tillegg til lokale appkall og mockede API-kall. Den blokkerer andre uventede eksterne kall. Apptestene er derfor isolert fra dekoratøren, men ikke helt offline.

Stubben krever `UU_TEST=1`, `ENABLE_MOCK=enabled`, `NEXT_PUBLIC_ENABLE_MOCK=enabled` og `NODE_ENV=development`. Den avviser smoke-modus og miljøer med `NAIS_CLUSTER_NAME`, `NAIS_APP_NAME` eller `NAIS_NAMESPACE`. Stubben kontrollerer miljøet ved oppstart og ved hvert fetch-kall, og avviser ukjente eksterne serverkall.

Smoke-serveren starter med tomme `NODE_OPTIONS` og `UU_TEST`, også når skallet eksporterer variablene. Smoke-testen bruker ekte dekoratør og får ikke teststubbens CSP-tillegg. Et eksternt avbrudd skal gi en feilet smoke-test, ikke skjules som et bestått resultat.

## Begrensninger og videre dekning

- Alle nettlesertestene kjører i Chromium. Testing i Safari, Firefox og med skjermlesere inngår i den manuelle guiden.
- Fast servermock viser ikke alle start- og snapshot-tilstander. Enhetstestene dekker navigeringsvalgene, og Storybook dekker under-18-komponentene. Den fulle server- og nettleserflyten for disse tilfellene er ikke verifisert.
- Appens cookie-banner, hopp-lenke og språkvelger leveres av dekoratøren. Smoke-testen dekker ikke disse interaksjonene. Test dem manuelt i dev. Mer integrasjonsdekning kan legges til uten å duplisere dekoratørens interne testpakke.
- Tilgjengelig navngiving, struktur og eksistensen av `lang`-attributter kan sjekkes automatisk. Om tekst, alternativtekst, oversettelse og opplesning er meningsfull, må vurderes manuelt.
- De samme testene kan kjøres lokalt og inngår i den eksisterende CI/CD-workflowen. En grønn CI-kjøring erstatter ikke manuell testing.

Ikke slå av regler, bruk `bypassCSP` eller skjul innhold for å få grønne resultater. Eventuelle avgrensninger skal beskrives sammen med hvilket innhold som ikke testes.

## Manuell testing

Bruk syntetiske data lokalt eller en testbruker fra Dolly i dev. Fullfør både en registrering og en oppdatering. Prøv også manglende svar, søk etter stilling, endring fra oppsummeringen, avbrudd og teknisk feil. Noter nettleser, hjelpemiddel, språk og dato.

| Kontroll | Slik tester du | Forventet resultat |
| --- | --- | --- |
| Tastatur | Legg bort musen. Bruk Tab og Shift+Tab mellom kontroller, piltaster i radiogrupper og søkeresultater, Enter eller Space for aktivering og Escape for lukking. | Du kan fullføre oppgaven og komme ut av søket og dialogen. Fokusrekkefølgen følger oppgaven og er synlig hele veien. |
| Stegbytte og feil | Gå videre uten å svare. Rett ett og flere manglende svar. Følg lenkene i feiloppsummeringen. Gå tilbake og endre tidligere svar. | Fokus og feiltekst viser hvor du er og hva som må rettes. Lenker går til riktig felt. Svar beholdes som forventet. |
| Skjermleser | Bruk VoiceOver med Safari og NVDA med Firefox eller Chrome. Les overskrifter og landemerker, og gjennomfør flyten både i lese- og skjemamodus. | Spørsmål og svar har meningsfulle navn. Grupper, feil, søkeresultater og kvittering formidles uten at du må se siden. Kontroller faktisk opplesning, ikke bare ARIA-attributter. |
| Zoom og tekst | Prøv 200 % tekstforstørrelse og 400 % nettleserzoom på desktop. Øk også linjeavstand til 1,5, bokstavavstand til 0,12 em, ordavstand til 0,16 em og avstand etter avsnitt til 2 em. | Innhold og handlinger forsvinner ikke, overlapper ikke og krever ikke unødvendig scrolling i to retninger. |
| Kontrast og fokus | Kontroller normaltilstand, fokus, feil og åpne søkeresultater. Bruk et kontrastverktøy når verdiene ikke kan avgjøres automatisk. Prøv også systemets høykontrastmodus. | Tekst, kontroller og fokusindikator kan oppfattes. Viktig betydning formidles ikke med farge alene. |
| Mobil | Test på en fysisk mobil i begge orienteringer, med stor tekst. Prøv eventuelt VoiceOver eller TalkBack. | Kontroller kan betjenes uten feiltrykk, og viktig innhold er ikke avklippet eller dekket av skjermtastaturet. |
| Innhold og språk | Les spørsmål, hjelp, lenker, feil og kvittering på hvert tilgjengelig språk. | Teksten forklarer hva du skal gjøre, hva som gikk galt og hva som skjer videre. Språkbytte gir riktig innhold og opplesning. |
| Ekte dekoratør og sesjon | Test i dev med testbruker. Bruk hopp-lenken, cookie-valgene og språkvelgeren med tastatur. Kontroller innlogging og utløpsvarsel. | Dekoratøren blokkerer ikke appens handlinger. Hopp-lenken flytter fokus til hovedinnholdet, og språkvalget fungerer sammen med skjemaet. |

## Registrer funn

For hvert funn: noter URL, språk, tilstand og nøyaktige steg for å gjenskape problemet. Beskriv forventet og faktisk resultat, berørt WCAG-kriterium når det er kjent, og hvem som følger opp. Noter også hvilke manuelle kontroller som ikke er gjennomført. Ikke legg ekte personopplysninger i skjermbilder, trace eller feilrapporter.

Ved `--max-failures=10` stopper Playwright etter ti feil. Tester merket `did not run` eller `interrupted` er ikke verifisert. Meldingen `Testing stopped early after 10 maximum allowed failures` kan vises som en feil utenfor testene; den beskriver selve stoppgrensen, ikke en ny feil i appen.
