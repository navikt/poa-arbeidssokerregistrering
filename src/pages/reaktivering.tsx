import { useEffect, useState } from 'react';
import { BodyLong, Button, GuidePanel, Heading } from '@navikt/ds-react';
import { useRouter } from 'next/router';

import lagHentTekstForSprak, { Tekster } from '../lib/lag-hent-tekst-for-sprak';
import useSprak from '../hooks/useSprak';
import { fetcher as api } from '../lib/api-utils';
import { loggAktivitet, loggStoppsituasjon, loggFlyt } from '../lib/amplitude';
import { hentRegistreringFeiletUrl } from '../lib/hent-registrering-feilet-url';
import { OppgaveRegistreringstype } from '../model/feilsituasjonTyper';
import { withAuthenticatedPage } from '../auth/withAuthentication';

const TEKSTER: Tekster<string> = {
    nb: {
        tittel: 'Du er ikke lenger registrert som arbeidssøker',
        maaSokePaaNytt:
            'Hvis du fortsatt skal motta ytelser må du først bekrefte at du ønsker å være registrert, så søke på nytt.',
        vilDuRegistreres: 'Ønsker du å være registrert som arbeidssøker?',
        ja: 'Ja, jeg vil være registrert',
        avbryt: 'Avbryt',
    },
};

const Reaktivering = () => {
    const [reaktiveringPagar, setReaktiveringPagar] = useState(false);
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);
    const router = useRouter();

    const loggAvbrytReaktivering = () => {
        loggAktivitet({ aktivitet: 'Arbeidssøkeren avslår reaktivering' });
        loggFlyt({ hendelse: 'Avbryter registreringen' });
        return router.push('/');
    };

    const reaktiverBruker = async () => {
        setReaktiveringPagar(true);
        loggAktivitet({ aktivitet: 'Arbeidssøkeren reaktiverer seg' });
        loggFlyt({ hendelse: 'Sender inn skjema for registrering' });

        const response = await api('api/reaktivering/', { method: 'post', body: JSON.stringify({}) });

        const feiltype = response.type;
        if (feiltype) {
            loggStoppsituasjon({
                situasjon: 'Arbeidssøkeren får ikke reaktivert seg',
                aarsak: feiltype,
            });
            loggFlyt({ hendelse: 'Får ikke fullført registreringen' });
            return router.push(hentRegistreringFeiletUrl(feiltype, OppgaveRegistreringstype.REAKTIVERING));
        } else {
            return router.push('/kvittering-reaktivering/');
        }
    };

    useEffect(() => {
        loggStoppsituasjon({
            situasjon: 'Arbeidssøkeren må reaktivere seg',
        });
    }, []);

    return (
        <>
            <Heading level="1" size={'large'} className={'mb-8'}>
                {tekst('tittel')}
            </Heading>
            <GuidePanel poster>
                <Heading spacing level="2" size={'medium'}>
                    {tekst('tittel')}
                </Heading>
                <BodyLong>{tekst('maaSokePaaNytt')}</BodyLong>
                <BodyLong>{tekst('vilDuRegistreres')}</BodyLong>
            </GuidePanel>
            <section className="flex-center mhl">
                <Button variant={'primary'} className="mrl" onClick={reaktiverBruker} disabled={reaktiveringPagar}>
                    {tekst('ja')}
                </Button>
                <Button variant={'secondary'} onClick={() => loggAvbrytReaktivering()}>
                    {tekst('avbryt')}
                </Button>
            </section>
        </>
    );
};

export const getServerSideProps = withAuthenticatedPage();
export default Reaktivering;
