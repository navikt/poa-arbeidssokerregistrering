import virkedager from '@alheimsins/virkedager';
import { Alert, AlertProps, BodyLong, BodyShort, GuidePanel, Heading, Link } from '@navikt/ds-react';

import useSprak from '../hooks/useSprak';

import lagHentTekstForSprak, { Tekster } from '../lib/lag-hent-tekst-for-sprak';
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
    },
};

export type Opprettelsesfeil = 'finnesAllerede' | 'opprettelseFeilet';

export const KvitteringOppgaveOpprettet = () => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    const idag = new Date();
    const toVirkedagerFraNaa = formaterDato(virkedager(idag, 2));

    return (
        <GuidePanel poster>
            <Alert variant="success" className={'mbm'}>
                <BodyShort spacing>Henvendelse mottatt</BodyShort>
                <BodyLong spacing>
                    Du er under 18 år og da trenger du samtykke fra foresatte for å kunne registrere deg som
                    arbeidssøker.
                </BodyLong>
                <BodyLong spacing>
                    En veileder hos oss vil kontakte deg innen utgangen av {toVirkedagerFraNaa}.
                </BodyLong>
                <BodyLong spacing>Veilederen vil hjelpe deg videre med samtykke og registrering.</BodyLong>
            </Alert>
            <BodyLong className="mbm">
                <strong>{tekst('kontaktopplysningerOppdatert')}</strong>
            </BodyLong>
            <Kontaktinformasjon />
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
            <Alert variant="error" className={'mbm'}>
                Klarte ikke å opprette henvendelsen
            </Alert>
            <BodyLong spacing>
                Du er under 18 år og da trenger du samtykke fra foresatte for å kunne registrere deg som arbeidssøker.
            </BodyLong>
            <BodyLong spacing>
                Vi har forsøkt å opprette en melding til en veileder som kan hjelpe deg videre, men det gikk ikke.
            </BodyLong>
            <BodyLong spacing>
                Prøv å registrere deg igjen senere, men hvis det fortsetter å feile så{' '}
                <Link href="https://www.nav.no/kontaktoss">ta kontakt med oss</Link>.
            </BodyLong>
        </GuidePanel>
    );
};

const Kvittering = (alertProps: AlertProps, infotekst: string, tittel?: string) => {
    return (
        <GuidePanel poster>
            <Alert variant={alertProps.variant} className={'mbm'}>
                {alertProps.children}
            </Alert>
            {tittel && (
                <Heading level="1" spacing size={'small'}>
                    {tittel}
                </Heading>
            )}
            <BodyLong className="mbm">{infotekst}</BodyLong>
            <Kontaktinformasjon />
        </GuidePanel>
    );
};
