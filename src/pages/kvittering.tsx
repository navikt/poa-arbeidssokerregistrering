import React from 'react';
import { BodyLong, GuidePanel, Heading, Link } from '@navikt/ds-react';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../hooks/useSprak';
import { useConfig } from '../contexts/config-context';
import { useFeatureToggles } from '../contexts/featuretoggle-context';

import { loggAktivitet, loggFlyt } from '../lib/amplitude';
import { Config } from '../model/config';
import { withAuthenticatedPage } from '../auth/withAuthentication';
import NyeRettigheterKvittering from '../components/nye-rettigheter-kvittering';

const TEKSTER: Tekster<string> = {
    nb: {
        header: 'Du er nå registrert som arbeidssøker',
        dagpengerTittel: 'Har du søkt om dagpenger?',
        permittert: 'Er du permittert eller arbeidsledig må du søke om dagpenger i egen søknad.',
        tidligstFaaDagpenger: 'Du kan tidligst få dagpenger fra den dagen du sender søknaden.',
        sendeSoknaden:
            'For å ikke tape dager med dagpenger må du sende søknaden senest samme dag som du ønsker dagpenger fra.',
        sokDagpenger: 'Søk dagpenger',
        skalIkkeSoke: 'Skal ikke søke nå',
    },
    nn: {
        header: 'Du er no registrert som arbeidssøkjar',
        dagpengerTittel: 'Har du søkt om dagpengar?',
        permittert: 'Viss du er permittert eller arbeidsledig, må du søkje om dagpengar i ein eigen søknad.',
        tidligstFaaDagpenger: 'Du kan få dagpengar tidlegast frå den dagen du sender inn søknaden.',
        sendeSoknaden:
            'For å unngå å tape dagar med dagpengar er det viktig at du sender søknaden seinast same dag som du ønskjer dagpengar frå.',
        sokDagpenger: 'Søk om dagpengar',
        skalIkkeSoke: 'Skal ikkje søkje no',
    },
};

const Kvittering = () => {
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);
    const { toggles } = useFeatureToggles();
    const fjernPlikter = toggles['arbeidssokerregistrering.fjern-plikter'];

    React.useEffect(() => {
        loggAktivitet({
            aktivitet: 'Viser kvittering',
        });
        loggFlyt({ hendelse: 'Registrering fullført' });
    }, []);

    const { dagpengesoknadUrl, dittNavUrl } = useConfig() as Config;

    return (
        <div className="max-w-4xl flex items-center justify-center flex-wrap">
            <Heading level="1" size={'large'}>
                {tekst('header')}
            </Heading>
            {fjernPlikter && (
                <div>
                    <NyeRettigheterKvittering />
                </div>
            )}
            <div className="flex flex-col items-center justify-center flex-wrap">
                <GuidePanel poster>
                    <Heading level={'2'} size={'medium'} className={'mb-6'}>
                        {tekst('dagpengerTittel')}
                    </Heading>
                    <BodyLong>{tekst('permittert')}</BodyLong>
                    <BodyLong>{tekst('tidligstFaaDagpenger')}</BodyLong>
                    <BodyLong>{tekst('sendeSoknaden')}</BodyLong>
                </GuidePanel>
                <a
                    href={dagpengesoknadUrl}
                    onClick={() =>
                        loggAktivitet({
                            aktivitet: 'Går til dagpenger fra kvittering',
                        })
                    }
                    className="my-8 navds-button navds-button--primary navds-button--medium"
                >
                    {tekst('sokDagpenger')}
                </a>
                <Link
                    href={dittNavUrl}
                    onClick={() =>
                        loggAktivitet({
                            aktivitet: 'Velger å ikke gå til dagpenger fra kvittering',
                        })
                    }
                >
                    {tekst('skalIkkeSoke')}
                </Link>
            </div>
        </div>
    );
};

export const getServerSideProps = withAuthenticatedPage();
export default Kvittering;
