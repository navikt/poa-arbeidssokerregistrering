import virkedager from '@alheimsins/virkedager';
import { Alert, AlertProps, BodyLong, BodyShort, GuidePanel, Heading, Link } from '@navikt/ds-react';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../hooks/useSprak';

import { formaterDato } from '../lib/date-utils';
import { Kontaktinformasjon } from './kontaktinformasjonUnder18';

const TEKSTER: Tekster<string> = {
    nb: {
        alertMottatt: 'Henvendelse mottatt',
        alertVennligstVent: 'Vennligst vent',
        alertFeil: 'Noe gikk galt',
        alleredeBedtOmKontakt:
            'Du har allerede bedt oss kontakte deg. Vi tar kontakt i løpet av to arbeidsdager regnet fra den første meldingen. Pass på at kontaktopplysningene dine er oppdatert ellers kan vi ikke nå deg.',
        klarteIkkeMotta:
            'Vi klarte ikke å ta imot henvendelsen din. Vennligst forsøk igjen senere. Opplever du dette flere ganger kan du ringe oss på 55 55 33 33.',
        viktig: 'Viktig:',
        kontakterDegInnen: 'Du vil bli kontaktet av en veileder innen utgangen av ',
        kontaktopplysningerOppdatert: 'Kontaktopplysningene dine må være oppdatert, ellers kan vi ikke nå deg.',
        henvendelseMottatt: 'Henvendelse mottatt',
        trengerSamtykke:
            'Du er under 18 år og da trenger du samtykke fra foresatte for å kunne registrere deg som arbeidssøker.',
        veilederKontakterDeg: 'En veileder hos oss vil kontakte deg innen utgangen av',
        veilederenHjelperDeg: 'Veilederen vil hjelpe deg videre med samtykke og registrering.',
        lesMerOmSamtykkeIntro: 'Du kan lese mer om',
        samtykkeIntroLenkeTekst: 'samtykke fra forestatte på nav.no',
        hvisDuIkkeVilRegistreres:
            'Hvis du ikke ønsker å registrere deg som arbeidssøker likevel eller heller vil snakke med oss på andre måter enn telefon så',
        taKontaktMedOss: 'ta kontakt med oss her',
        klarteIkkeOppretteHenvendelsen: 'Klarte ikke å opprette henvendelsen',
        duErUnder18:
            'Du er under 18 år og da trenger du samtykke fra foresatte for å kunne registrere deg som arbeidssøker.',
        viHarForsoektOppretteMelding:
            'Vi har forsøkt å opprette en melding til en veileder som kan hjelpe deg videre, men det gikk ikke.',
        proevSenere: 'Prøv å registrere deg igjen senere, men hvis det fortsetter å feile så',
    },
};

export type Opprettelsesfeil = 'finnesAllerede' | 'opprettelseFeilet';

export const KvitteringOppgaveOpprettet = () => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    const idag = new Date();
    const toVirkedagerFraNaa = formaterDato(virkedager(idag, 2));

    return (
        <GuidePanel poster>
            <Alert variant="success" className={'mb-6'}>
                <BodyShort spacing>{tekst('henvendelseMottatt')}</BodyShort>
                <BodyLong spacing>{tekst('trengerSamtykke')}</BodyLong>
                <BodyLong spacing>
                    {tekst('veilederKontakterDeg')} {toVirkedagerFraNaa}.
                </BodyLong>
                <BodyLong spacing>{tekst('veilederenHjelperDeg')}</BodyLong>
                <BodyLong spacing>
                    {tekst('lesMerOmSamtykkeIntro')}{' '}
                    <Link href="https://www.nav.no/samtykke-oppfolging-unge">{tekst('samtykkeIntroLenkeTekst')}</Link>.
                </BodyLong>
            </Alert>
            <BodyLong className="mb-6">
                <strong>{tekst('kontaktopplysningerOppdatert')}</strong>
            </BodyLong>
            <div className="mb-8">
                <Kontaktinformasjon />
            </div>
            <BodyLong spacing>
                {tekst('hvisDuIkkeVilRegistreres')}{' '}
                <Link href="https://www.nav.no/kontaktoss">{tekst('taKontaktMedOss')}</Link>.
            </BodyLong>
        </GuidePanel>
    );
};

export const KvitteringOppgaveIkkeOpprettet = (props: { feil: Opprettelsesfeil }) => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    if (props.feil === 'finnesAllerede') {
        return Kvittering({ variant: 'info', children: tekst('alertVennligstVent') }, tekst('alleredeBedtOmKontakt'));
    }
    return (
        <GuidePanel poster>
            <Alert variant="error" className={'mb-6'}>
                {tekst('klarteIkkeOppretteHenvendelsen')}
            </Alert>
            <BodyLong spacing>{tekst('duErUnder18')}</BodyLong>
            <BodyLong spacing>{tekst('viHarForsoektOppretteMelding')}</BodyLong>
            <BodyLong spacing>
                {tekst('proevSenere')} <Link href="https://www.nav.no/kontaktoss">{tekst('taKontaktMedOss')}</Link>.
            </BodyLong>
        </GuidePanel>
    );
};

const Kvittering = (alertProps: AlertProps, infotekst: string, tittel?: string) => {
    return (
        <GuidePanel poster>
            <Alert variant={alertProps.variant} className={'mb-6'}>
                {alertProps.children}
            </Alert>
            {tittel && (
                <Heading level="1" spacing size={'small'}>
                    {tittel}
                </Heading>
            )}
            <BodyLong className="mb-6">{infotekst}</BodyLong>
            <Kontaktinformasjon />
        </GuidePanel>
    );
};
