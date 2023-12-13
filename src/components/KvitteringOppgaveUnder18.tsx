import virkedager from '@alheimsins/virkedager';
import { Alert, AlertProps, BodyLong, GuidePanel, Heading } from '@navikt/ds-react';

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
    const suksessTekst = tekst('kontakterDegInnen') + toVirkedagerFraNaa + '. ';

    return (
        <GuidePanel poster>
            <Alert variant="success" className={'mb-6'}>
                {tekst('alertMottatt')}
                <BodyLong>{suksessTekst}</BodyLong>
            </Alert>
            <BodyLong className="mb-6">
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
            <Alert variant="error" className={'mb-6'}>
                {tekst('alertFeil')}
            </Alert>
            <BodyLong className="mb-6">{tekst('klarteIkkeMotta')}</BodyLong>
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
