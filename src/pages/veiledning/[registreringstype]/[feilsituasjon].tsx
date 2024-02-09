import { useCallback, useEffect, useState } from 'react';
import { BodyLong, Button, GuidePanel, Heading } from '@navikt/ds-react';
import { preload } from 'swr';
import { useRouter } from 'next/router';

import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import useSprak from '../../../hooks/useSprak';
import { loggAktivitet, loggStoppsituasjon } from '../../../lib/amplitude';
import { fetcher, fetcher as api } from '../../../lib/api-utils';
import {
    KvitteringOppgaveIkkeOpprettet,
    KvitteringOppgaveOpprettet,
    Opprettelsesfeil,
} from '../../../components/KvitteringOppgave';
import { FeilmeldingGenerell } from '../../../components/feilmeldinger/feilmeldinger';
import { Feiltype, OppgaveRegistreringstype } from '../../../model/feilsituasjonTyper';
import { withAuthenticatedPage } from '../../../auth/withAuthentication';

interface Feilsituasjon {
    oppgaveRegistreringstype?: OppgaveRegistreringstype;
    feiltype?: Feiltype;
}

const TEKSTER: Tekster<string> = {
    nb: {
        heading: 'En veileder må hjelpe deg slik at du blir registrert',
        utvandretBody1: 'Du står registrert som utvandret i våre systemer.',
        manglerArbeidstillatelseBody1: 'Vi har ikke mulighet til å sjekke om du har en godkjent oppholdstillatelse.',
        body2: 'Dette gjør at du ikke kan registrere deg som arbeidssøker på nett.',
        kontaktOss: 'Kontakt oss, så hjelper vi deg videre.',
        kontaktOssMedTlfnr: 'Ring oss på 55 55 33 33, så hjelper vi deg videre.',
        kontaktKnapp: 'Ta kontakt',
        avbryt: 'Avbryt',
    },
    nn: {
        heading: 'Ein rettleiar må hjelpe med å registrere deg ',
        utvandretBody1: 'Du står registrert som utvandra i systema våre.',
        manglerArbeidstillatelseBody1: 'Vi har ikkje høve til å sjekke om du har godkjent opphaldsløyve.',
        body2: 'Dette gjer at du ikkje kan registrere deg som arbeidssøkjar på nett.',
        kontaktOss: 'Kontakt oss, så hjelper vi deg vidare.',
        kontaktOssMedTlfnr: 'Ring oss på 55 55 33 33, så hjelper vi deg vidare.',
        kontaktKnapp: 'Ta kontakt',
        avbryt: 'Avbryt',
    },
    en: {
        heading: 'A counsellor must help you register',
        utvandretBody1: 'You are registered as an emigrant in our systems.',
        manglerArbeidstillatelseBody1: 'We are not able to check whether you have an approved residence permit.',
        body2: 'This means that you cannot register as a jobseeker online.',
        kontaktOss: 'Contact us and we will help you further.',
        kontaktOssMedTlfnr: 'Call us by phone (+47 55 55 33 33), and we will help you further.',
        kontaktKnapp: 'Contact Us',
        avbryt: 'Cancel',
    },
};

const KontaktVeileder = (props: Feilsituasjon) => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const [responseMottatt, settResponseMottatt] = useState<boolean>(false);
    const [feil, settFeil] = useState<Opprettelsesfeil | undefined>();
    const Router = useRouter();

    const opprettOppgave = useCallback(async () => {
        loggAktivitet({ aktivitet: 'Oppretter kontakt meg oppgave' });
        try {
            const oppgaveType = props.feiltype === Feiltype.UTVANDRET ? 'UTVANDRET' : 'OPPHOLDSTILLATELSE';
            await api('/api/oppgave', {
                method: 'post',
                body: JSON.stringify({ oppgaveType: oppgaveType }),
                onError: (res) => {
                    if (res.status === 403) {
                        settFeil('finnesAllerede');
                    } else {
                        throw Error(res.statusText);
                    }
                },
            });
        } catch (e) {
            settFeil('opprettelseFeilet');
        }
        settResponseMottatt(true);
    }, [props.feiltype]);

    const avbrytKontaktMeg = () => {
        loggAktivitet({ aktivitet: 'Avbryter kontakt meg' });
        Router.push('/');
    };

    useEffect(() => {
        loggStoppsituasjon({
            situasjon: 'Arbeidssøkeren mangler arbeidstillatelse eller er utvandret',
        });
    }, []);

    // initialiser for <Kvittering>
    preload('api/kontaktinformasjon/', fetcher);

    if (props.feiltype === undefined || !Object.values(Feiltype).includes(props.feiltype)) {
        return <FeilmeldingGenerell />;
    }

    if (responseMottatt) {
        return feil ? <KvitteringOppgaveIkkeOpprettet feil={feil} /> : <KvitteringOppgaveOpprettet />;
    } else
        return (
            <>
                <GuidePanel poster>
                    <Heading size="medium" spacing={true} level="1">
                        {tekst('heading')}
                    </Heading>
                    <BodyLong>
                        {tekst(
                            props.feiltype === Feiltype.UTVANDRET ? 'utvandretBody1' : 'manglerArbeidstillatelseBody1',
                        )}
                    </BodyLong>
                    <BodyLong spacing>{tekst('body2')}</BodyLong>
                    <BodyLong>
                        {props.oppgaveRegistreringstype === OppgaveRegistreringstype.REGISTRERING
                            ? tekst('kontaktOss')
                            : tekst('kontaktOssMedTlfnr')}
                    </BodyLong>
                </GuidePanel>
                {props.oppgaveRegistreringstype === OppgaveRegistreringstype.REGISTRERING && (
                    <section className="flex items-center justify-center my-8">
                        <Button onClick={opprettOppgave} className="mr-8">
                            {tekst('kontaktKnapp')}
                        </Button>
                        <Button variant="tertiary" onClick={avbrytKontaktMeg}>
                            {tekst('avbryt')}
                        </Button>
                    </section>
                )}
            </>
        );
};

export const getServerSideProps = withAuthenticatedPage(async (context) => {
    const { registreringstype, feilsituasjon } = context.query;

    return {
        props: {
            oppgaveRegistreringstype: registreringstype as OppgaveRegistreringstype,
            feiltype: feilsituasjon as Feiltype,
        },
    };
});

export default KontaktVeileder;
