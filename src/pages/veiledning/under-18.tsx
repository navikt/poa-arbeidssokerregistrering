import { useCallback, useState } from 'react';
import { BodyLong, GuidePanel, Heading, Button } from '@navikt/ds-react';
import { preload } from 'swr';
import { useRouter } from 'next/router';

import lagHentTekstForSprak, { Tekster } from '../../lib/lag-hent-tekst-for-sprak';
import useSprak from '../../hooks/useSprak';

import { loggAktivitet } from '../../lib/amplitude';

import {
    KvitteringOppgaveIkkeOpprettet,
    KvitteringOppgaveOpprettet,
    Opprettelsesfeil,
} from '../../components/KvitteringOppgave';
import { fetcher, fetcher as api } from '../../lib/api-utils';
import { withAuthenticatedPage } from '../../auth/withAuthentication';

const TEKSTER: Tekster<string> = {
    nb: {
        overskrift: 'Du trenger samtykke for å registrere deg',
        samtykke: 'Personer under 18 år trenger samtykke for å registrere seg som arbeidssøker.',
        sorry: 'Du kan derfor ikke registrere deg på nett.',
        sendMelding: 'Send oss beskjed om at du ønsker å registrere deg, så vil en veileder ta kontakt.',
        veileder:
            'Veilederen vil hjelpe deg med registreringen og gi mer informasjon om hvilke tjenester NAV kan tilby deg.',
        knappeTekst: 'Jeg ønsker å bli kontaktet av en veileder',
        avbryt: 'Avbryt',
    },
};

function Under18() {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const [responseMottatt, settResponseMottatt] = useState<boolean>(false);
    const [feil, settFeil] = useState<Opprettelsesfeil | undefined>(undefined);
    const Router = useRouter();
    preload('api/kontaktinformasjon/', fetcher);

    const opprettOppgave = useCallback(async () => {
        loggAktivitet({ aktivitet: 'Oppretter kontakt meg oppgave' });
        try {
            await api('/api/oppgave', {
                method: 'post',
                body: JSON.stringify({ oppgaveType: 'UNDER_18' }),
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
    }, []);

    const avbrytKontaktMeg = () => {
        loggAktivitet({ aktivitet: 'Avbryter kontakt meg' });
        Router.push('/');
    };

    if (responseMottatt) {
        return feil ? <KvitteringOppgaveIkkeOpprettet feil={feil} /> : <KvitteringOppgaveOpprettet />;
    } else
        return (
            <>
                <GuidePanel poster>
                    <Heading spacing size="large" level="1">
                        {tekst('overskrift')}
                    </Heading>
                    <BodyLong>{tekst('samtykke')}</BodyLong>
                    <BodyLong>{tekst('sorry')}</BodyLong>
                    <BodyLong>{tekst('sendMelding')}</BodyLong>
                    <BodyLong>{tekst('veileder')}</BodyLong>
                </GuidePanel>
                <section className="flex-center mhl">
                    <Button onClick={opprettOppgave} className="mrl">
                        {tekst('knappeTekst')}
                    </Button>
                    <Button variant="tertiary" onClick={avbrytKontaktMeg}>
                        {tekst('avbryt')}
                    </Button>
                </section>
            </>
        );
}

export const getServerSideProps = withAuthenticatedPage();
export default Under18;
