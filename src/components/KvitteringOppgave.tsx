import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import useSprak from '../hooks/useSprak';
import { formaterDato } from '../lib/date-utils';
import virkedager from '@alheimsins/virkedager';
import { Alert, AlertProps, BodyLong, GuidePanel, Heading } from '@navikt/ds-react';
import { Kontaktinformasjon } from './kontaktinformasjon';

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
        kontakterDegInnen: 'Vi kontakter deg innen utgangen av ',
        kontaktopplysningerOppdatert: 'Pass på at kontaktopplysningene dine er oppdatert, ellers kan vi ikke nå deg.',
    },
    nn: {
        alertMottatt: 'Førespurnad motteken',
        alertVennligstVent: 'Vent litt',
        alertFeil: 'Noko gjekk gale',
        alleredeBedtOmKontakt:
            'Du har allereie spurt oss om å kontakte deg. Vi tek kontakt i løpet av to arbeidsdagar rekna frå første melding. Pass på at kontaktopplysningane dine er oppdaterte, slik at vi kan nå tak i deg.',
        klarteIkkeMotta:
            'Vi klarte ikkje å ta imot førespurnaden din. Prøv igjen seinare. Viss det same skjer gong på gong, kan du ringje oss på 55 55 33 33.',
        viktig: 'Viktig:',
        kontakterDegInnen: 'Vi tek kontakt innen utgangen av ',
        kontaktopplysningerOppdatert:
            'Pass på at kontaktopplysningane dine er oppdaterte, slik at vi kan nå tak i deg.',
    },
    en: {
        alertMottatt: 'Request received',
        alertVennligstVent: 'Please wait',
        alertFeil: "We're having trouble",
        alleredeBedtOmKontakt:
            'We have received your first message. We will contact you within two working days from the first message. Please make sure your contact details are updated.',
        klarteIkkeMotta:
            'We’re having trouble with your request right now. Please try again later. If you are still having problems, you can call us on 55 55 33 33.',
        viktig: 'Important:',
        kontakterDegInnen: 'We will contact you before the end of ',
        kontaktopplysningerOppdatert: 'Please make sure your contact details are updated.',
    },
};

export type Opprettelsesfeil = 'finnesAllerede' | 'opprettelseFeilet';

export const KvitteringOppgaveOpprettet = () => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    const idag = new Date();
    const toVirkedagerFraNaa = formaterDato(virkedager(idag, 2));

    const alertProps: AlertProps = { variant: 'success', children: tekst('alertMottatt') };
    const tittel = tekst('viktig');
    const infotekst = tekst('kontakterDegInnen') + toVirkedagerFraNaa + '. ' + tekst('kontaktopplysningerOppdatert');

    return Kvittering(alertProps, infotekst, tittel);
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
