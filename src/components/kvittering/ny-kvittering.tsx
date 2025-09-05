import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { BodyLong, BodyShort, Heading, HGrid } from '@navikt/ds-react';
import { lagHentTekstForSprak } from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../../hooks/useSprak';
import { useConfig } from '../../contexts/config-context';

import { Config } from '../../model/config';
import kvitteringIkonSvg from './kvittering-ikon.svg';
import LenkePanel from '../lenke-panel';
import { loggAktivitet } from '../../lib/tracker';
import Overskrift from '../skjema/overskrift';

const TEKSTER = {
    nb: {
        sideTittel: 'Du er nå registrert som arbeidssøker',
        heading: 'Du er registrert som arbeidssøker',
        body1: 'Du må bekrefte at du ønsker å være registrert hver 14. dag.',
        body2: 'Nav vil vurdere de opplysningene du har gitt oss mot opplysningene vi har om andre arbeidssøkere i omtrent samme situasjon. Basert på dette vil en veileder fatte et oppfølgingsvedtak som sendes til deg. Vedtaket forteller hvordan Nav vurderer din situasjon i arbeidsmarkedet og hvilken hjelp du kan få fra Nav.',
        innholdHeading: 'Innhold for deg som er arbeidssøker',
        bekreftelseLenkeHref: 'https://www.nav.no/bekreft-arbeidssoker',
        bekreftelseLenkeTittel: 'Bekreft at du vil være registrert som arbeidssøker',
        bekreftelseLenkeBeskrivelse: 'Slik bekrefter du arbeidssøkerperioden din',
        minSideLenkePostfix: '',
        minSideLenkeTittel: 'Min side',
        minSideLenkeBeskrivelse: 'Oversikt over tjenester og pengestøtte du får fra Nav',
        dagpengerLenkePostfix: '',
        dagpengerLenkeTittel: 'Søknad om dagpenger',
        dagpengerLenkeBeskrivelse: 'Søk digitalt',
    },
    nn: {
        sideTittel: 'Du er no registrert som arbeidssøkjar',
        heading: 'Du er registrert som arbeidssøkjar',
        body1: 'Du må stadfesta at du ønskjer å vera registrert kvar 14. dag.',
        body2: 'Nav vil vurdera dei opplysningane du har gitt oss mot opplysningane me har om andre arbeidssøkjarar i omtrent same situasjon. Basert på dette vil ein rettleiar gjera eit oppfølgingsvedtak som blir sendt til deg. Vedtaket fortel korleis Nav vurderer din situasjon i arbeidsmarknaden og kva hjelp du kan få frå Nav.',
        innholdHeading: 'Innhald for deg som er arbeidssøkjar',
        bekreftelseLenkeHref: 'https://www.nav.no/bekreft-arbeidssoker/nn',
        bekreftelseLenkeTittel: 'Stadfest at du vil vera registrert som arbeidssøkjar',
        bekreftelseLenkeBeskrivelse: 'Slik stadfestar du arbeidssøkjarperioden din',
        minSideLenkePostfix: '/nn',
        minSideLenkeTittel: 'Mi side',
        minSideLenkeBeskrivelse: 'Oversikt over tenester og pengestøtte du får frå Nav',
        dagpengerLenkePostfix: '',
        dagpengerLenkeTittel: 'Søknad om dagpengar',
        dagpengerLenkeBeskrivelse: 'Søk digitalt',
    },
    en: {
        sideTittel: 'You are now registered as a jobseeker',
        heading: 'You are registered as a jobseeker',
        body1: 'To stay registered as a jobseeker with Nav, you must send a confirmation of this every 14 days.',
        body2: 'Nav will assess the information you have given us against the information we have about other job seekers in a similar situation. Based on this, a counselor will make a follow-up decision that will be sent to you. The decision will explain how Nav assesses your situation in the labor market and what help you can get from Nav.',
        innholdHeading: 'Content for jobseekers',
        bekreftelseLenkeHref: 'https://www.nav.no/confirm-jobseeker/en',
        bekreftelseLenkeTittel: 'Confirm that you want to be registered as a jobseeker',
        bekreftelseLenkeBeskrivelse: 'How to confirm your status as a jobseeker',
        minSideLenkePostfix: '/en',
        minSideLenkeTittel: 'My page',
        minSideLenkeBeskrivelse: 'View your services as a job seeker',
        dagpengerLenkePostfix: '',
        dagpengerLenkeTittel: 'Application for unemployment benefit',
        dagpengerLenkeBeskrivelse: 'Apply digitally',
    },
};

const NyKvittering = () => {
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);
    const { dittNavUrl, dagpengesoknadUrl } = useConfig() as Config;
    return (
        <div className="max-w-4xl">
            <Head>
                <title>{tekst('sideTittel')}</title>
            </Head>
            <HGrid columns={{ sm: 1, md: 1, lg: '1fr auto', xl: '1fr auto' }} gap={{ lg: 'space-24' }}>
                <div style={{ width: '96px', height: '96px' }}>
                    <Image src={kvitteringIkonSvg} alt="ikon" width={96} height={96} />
                </div>
                <div>
                    <Overskrift erKvittering={true} />
                    <BodyShort spacing>{tekst('body1')}</BodyShort>
                    <BodyLong spacing>{tekst('body2')}</BodyLong>
                    <Heading spacing size={'small'} level={'3'}>
                        {tekst('innholdHeading')}
                    </Heading>
                    <ul className={'list-none'}>
                        <li className={'mb-4'}>
                            <LenkePanel
                                href={tekst('bekreftelseLenkeHref')}
                                title={tekst('bekreftelseLenkeTittel')}
                                description={tekst('bekreftelseLenkeBeskrivelse')}
                                onClick={() =>
                                    loggAktivitet({
                                        aktivitet: 'Går til bekreftelse fra kvittering',
                                    })
                                }
                            />
                        </li>
                        <li className={'mb-4'}>
                            <LenkePanel
                                href={`${dittNavUrl}${tekst('minSideLenkePostfix')}`}
                                title={tekst('minSideLenkeTittel')}
                                description={tekst('minSideLenkeBeskrivelse')}
                                onClick={() =>
                                    loggAktivitet({
                                        aktivitet: 'Går til min side fra kvittering',
                                    })
                                }
                            />
                        </li>
                        <li className={'mb-4'}>
                            <LenkePanel
                                href={`${dagpengesoknadUrl}${tekst('dagpengerLenkePostfix')}`}
                                title={tekst('dagpengerLenkeTittel')}
                                description={tekst('dagpengerLenkeBeskrivelse')}
                                onClick={() =>
                                    loggAktivitet({
                                        aktivitet: 'Går til dagpenger fra kvittering',
                                    })
                                }
                            />
                        </li>
                    </ul>
                </div>
            </HGrid>
        </div>
    );
};

export default NyKvittering;
