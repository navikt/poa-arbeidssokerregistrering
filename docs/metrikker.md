# Metrikker

Vi har ulike metrikker for hvordan løsningen brukes av arbeidssøker og rent tekniske metrikker for hvordan løsningen har det i produksjon.

-   [Dashboard i Amplitude](https://analytics.amplitude.com/nav/dashboard/jbs02pj) for bruk av løsningen
-   [Dashboard i Grafana](https://grafana.nais.io/d/000000283/nais-app-dashbord?orgId=1&refresh=1m&var-interval=$__auto_interval_interval&var-datasource=prod-gcp&var-team=tbd&var-app=poa-arbeidssokerregistrering&var-namespace=paw&var-docker_image=c6938a0fe9fbc0cd6076ebb2ffa13e1069e6f4ce&var-ingress_url=All) teknisk

# Metrikker i Amplitude

Dersom du vil lage egne rapporter utover de som ligger på dashboardet er det satt målinger omkring følgende hendelser.

`brukergruppe` og `registreringstype` er tilgjengelig på alle hendelser. Disse vil stå som `Ikke tilgjengelig` på hendelser som logges før opplysningene er hentet (typisk på forsiden)

## Flyt

Viser de ulike flytene gjennom registreringen.

Kan hentes ut ved å sjekke `arbeidssokerregistrering.flyt` og gruppere på `hendelse`.
For å se hvilket registreringsløp hendelsen gjelder kan du gruppere på `registreringstype`

### Hendelser

`Ikke mulig å starte registreringen`
Arbeidssøkeren er logget inn og men får ikke startet registreringen fordi vedkommende kommer opp som allerede registrert.
Dette kan skyldes at personen ligger inne i Arena med IARBS (systemproblem) eller at de har ARBS og sendes videre til AiA (kommunikasjon eller systemproblem).
Kan filtreres på `aarsak`

`Starter registrering`
Arbeidssøkeren er logget inn og skal starte på registreringsskjemaet

`Sender inn skjema for registrering`
Registreringsskjemaet sendes inn

`Avbryter registreringen`
Arbeidssøkeren avbryter registreringen før fullføring via avbryt knappen i skjema

`Får ikke fullført registreringen`
Tekniske feil eller andre NAV-interne årsaker gjør at arbeidssøkeren ikke får registrert seg.
Kan grupperes på `aarsak` for å se hvilken feiltype som var grunnen til at registreringen feilet.

`Registrering fullført`
Arbeidssøkeren er registrert.
Vil logges når kvitteringen vises eller når arbeidssøkeren videresendes til AiA

## Stoppsituasjoner

Situasjoner som gjør at arbeidssøkeren ikke får registrert seg.

Kan hentes ut ved å sjekke `arbeidssokerregistrering.stoppsituasjoner` og gruppere på `situasjon`.
På situasjonen `Arbeidssøkeren må reaktivere seg` kan du også gruppere på `brukergruppe` og/eller `registreringstype` for å se hvilke grupper som møtte stoppsituasjonen

### Situasjoner

`Arbeidssøkeren må reaktivere seg`
Arbeidssøkeren har falt ut av NAV-systemet og det har gått kortere tid enn 28 dager siden det skjedde.
Her er det mulig å gruppere på `brukergruppe` for å se hvilken status arbeidssøkeren hadde før hen falt ut.

`Arbeidssøkeren mangler arbeidstillatelse eller er utvandret`
Denne kan skyldes at NAV ikke har oppdaterte opplysninger om arbeidssøkeren i vår systemer.
I de tilfellene må en veileder gjøre en manuell jobb for å oppdatere opplysningene.

`Arbeidssøkeren er allerede registrert`
Denne kommer opp for brukere som ikke får registrert seg på grunn av mismatch i baksystemene til NAV.
Det kan være at de er i gruppen IARBS eller annet.

`Arbeidssøkeren får en feilmelding`
Dette er en samlemelding over feilsituajoner hvor vi ikke kan gi en god forklaring på hva som har skjedd elelr hvordan den kan løses.
Typisk skjer dette ved uforutsette tekniske feil i baksystemene og hvor bruker bare får beskjed om å prøve igjen senere.

`Arbeidssøkeren får ikke registrert seg pga nedetid`
Denne vises dersom systemet er togglet av pga for eksempel planlagt vedlikehold av Arena.

## Brukeradferd

Målinger omkring brukeradferd.

Kan hentes ut ved å sjekke `arbeidssokerregistrering.aktiviteter` og `arbeidssokerregistrering.besvarelser`

-   Hvor lang tid bruker man på å fylle ut skjemaet?
-   Hvor mange treffer feilsituasjoner?
-   Hvor mange får registrert seg vellykket?
-   Hva svarer man på du ulike spørsmålene?
-   Hvilken flyt havner brukeren på?
-   Hva gjør de etter registrering?

### Aktiviteter

Kan hentes ut ved å sjekke `arbeidssokerregistrering.aktiviteter` og vil kunne grupperes på `aktivitet`.
I noen tilfeller finnes også informasjon om `tidBruktForAaFullforeSkjema` eller `innsatsgruppe`

### aktiviteter.aktivitet

-   `Viser kvittering` - Har gjennomført en av registreringene og ser kvitteringssiden
-   `Går til dagpenger fra kvittering` - Går til dagpengesiden fra fullført ordinær registrering
-   `Velger å ikke gå til dagpenger fra kvittering` - Går til minside fra fullført ordinær registrering
-   `Utfylling av skjema fullført` - Skjema for registrering er fullført og sendes inn
-   `Start registrering` - Trigges av skjema-side-factory
-   `Går til start registrering` - Trykker på start registreringsknappen på forsiden
-   `Avbryter registreringen` - Trykker på avbryt knappen i avbryt registrering modalen
-   `Fortsetter til sykmeldtregistrering` - Trykker på fortsett-knappen på mellomsiden for sykmeldt-registreringen
-   `Oppretter kontakt meg oppgave` - Trykker på Ta kontakt-knappen fra siden man kommer til ved manglende oppholdstillatelse eller utvandret
-   `Avbryter kontakt meg` - Trykker på Avbryt-knappen fra siden man kommer til ved manglende oppholdstillatelse eller utvandret
-   `Endrer foreslått stilling` - Endrer foreslått stilling i registreringsskjemaet
-   `Viser forsiden for arbeidssøkerregistreringen` - Viser forsiden av registreringen
-   `Åpner bistandsbehov` - Åpner ReadMore om hvordan NAV vurderer bistandsbehovet på forsiden
-   `Går til lovdata` - Går til lovdata i ny fane
-   `Går til personvernsiden` - Går til NAVs side om personvern
-   `Åpner personopplysninger` - Åpner ReadMore om personvern på forsiden

### Besvarelser

Kan hentes ut ved å sjekke `arbeidssokerregistrering.besvarelser` og grupperes på `sporsmalId`

## Feedback

Brukes i forbindelse med feedback-komponenten vår, som lar bruker svare på om innholdet var nyttig eller ikke.
Inneholder `id` som beskriver hvilket tema tilbakemeldingen gjelder, og `feedback` som inneholder brukerens svar (ja/nei/vet ikke).

Kan hentes ut ved å sjekke `arbeidssokerregistrering.feedback` og grupperes på `id`

## Eksperimenter

Egne målinger satt opp omkring eksperimenter vi kjører.

Kan hentes ut ved å sjekke `arbeidssokerregistrering.eksperimenter`.
Kan grupperes på `eksperiment` og vil i noen tilfeller også ha med info om `situasjon` og `brukergruppe`
