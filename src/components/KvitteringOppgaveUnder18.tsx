'use client';

import Head from 'next/head';
import Image from 'next/image';
import virkedager from '@alheimsins/virkedager';
import { BodyLong, Heading, HGrid, GlobalAlert } from '@navikt/ds-react';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../hooks/useSprak';

import { formaterDato } from '@/lib/date-utils';
import { loggAktivitet } from '@/lib/tracker';
import LenkePanel from '../components/lenke-panel';
import kvitteringIkonSvg from './kvittering-under18-ikon.svg';

const TEKSTER: Tekster<string> = {
    nb: {
        sideTittel: 'Du trenger samtykke for å registrere deg som arbeidssøker',
        tittel: 'Du ønsker å registrere deg som arbeidssøker',
        samtykkeLenke: 'https://www.nav.no/samtykke-foresatte',
        samtykkeLenkeTittel: 'Samtykke fra foresatte',
        samtykkeLenkeBeskrivelse: 'Les om hvorfor vi må ha samtykke og finn lenke til samtykkeskjema',
        oppdatereOpplysningerLenke: 'https://www.nav.no/person/personopplysninger/nb/#kontaktinformasjon',
        oppdatereOpplysningerLenkeTittel: 'Oppdater kontaktinformasjonen din',
        oppdatereOpplysningerLenkeBeskrivelse: 'Se om kontaktinformasjonen vi har om deg er riktig',
        kontaktOssLenke: 'https://www.nav.no/kontaktoss',
        kontaktOssLenkeTittel: 'Kontakt oss',
        kontaktOssLenkeBeskrivelse: 'Ta kontakt med Nav',
        alertTittel: 'Du må ha samtykke for å registrere deg',
        alertContent1:
            'Du er under 18 år og trenger samtykke fra foresatte for å kunne registrere deg som arbeidssøker',
        alertContent2: 'En veileder hos oss vil kontakte deg innen utgangen av',
        alertContent3: 'Veilederen vil hjelpe deg videre med samtykke og registrering',
    },
    nn: {
        sideTittel: 'Du treng samtykke for å registrera deg som arbeidssøkjar',
        tittel: 'Du ønskjer å registrera deg som arbeidssøkjar',
        samtykkeLenke: 'https://www.nav.no/samtykke-foresatte',
        samtykkeLenkeTittel: 'Samtykke frå føresette',
        samtykkeLenkeBeskrivelse: 'Les om kvifor me må ha samtykke og finn lenkja til samtykkeskjema',
        oppdatereOpplysningerLenke: 'https://www.nav.no/person/personopplysninger/nn/#kontaktinformasjon',
        oppdatereOpplysningerLenkeTittel: 'Oppdater kontaktinformasjonen din',
        oppdatereOpplysningerLenkeBeskrivelse: 'Sjå om kontaktinformasjonen me har om deg er rett',
        kontaktOssLenke: 'https://www.nav.no/kontaktoss',
        kontaktOssLenkeTittel: 'Kontakt oss',
        kontaktOssLenkeBeskrivelse: 'Ta kontakt med Nav',
    },
    en: {
        sideTittel: 'You need consent to register as a job seeker',
        tittel: 'You want to register as a job seeker',
        samtykkeLenke: 'https://www.nav.no/parental-consent/en',
        samtykkeLenkeTittel: 'Consent from guardians',
        samtykkeLenkeBeskrivelse: 'Read about why we need consent and find a link to the consent form.',
        oppdatereOpplysningerLenke: 'https://www.nav.no/person/personopplysninger/en/#kontaktinformasjon',
        oppdatereOpplysningerLenkeTittel: 'Update your contact information',
        oppdatereOpplysningerLenkeBeskrivelse: 'Check if your contact information is correct.',
        kontaktOssLenke: 'https://www.nav.no/kontaktoss/en',
        kontaktOssLenkeTittel: 'Contact us',
        kontaktOssLenkeBeskrivelse: 'Contact Nav',
    },
};

export const KvitteringOppgaveOpprettet = () => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    const idag = new Date();
    const toVirkedagerFraNaa = formaterDato(virkedager(idag, 2));

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
                    <Heading size={'xlarge'} level={'1'} spacing>
                        {tekst('tittel')}
                    </Heading>
                    <GlobalAlert status="warning">
                        <GlobalAlert.Header>
                            <GlobalAlert.Title>{tekst('alertTittel')}</GlobalAlert.Title>
                        </GlobalAlert.Header>
                        <GlobalAlert.Content>
                            <BodyLong spacing>{tekst('alertContent1')}</BodyLong>
                            <BodyLong spacing>
                                {tekst('alertContent2')} {toVirkedagerFraNaa} {tekst('alertContent3')}
                            </BodyLong>
                        </GlobalAlert.Content>
                    </GlobalAlert>
                    <ul className={'list-none mt-8'}>
                        <li className={'mb-4'}>
                            <LenkePanel
                                href={tekst('samtykkeLenke')}
                                title={tekst('samtykkeLenkeTittel')}
                                description={tekst('samtykkeLenkeBeskrivelse')}
                                onClick={() =>
                                    loggAktivitet({
                                        aktivitet: 'Går til Samtykke fra foresatte',
                                    })
                                }
                            />
                        </li>
                        <li className={'mb-4'}>
                            <LenkePanel
                                href={tekst('oppdatereOpplysningerLenke')}
                                title={tekst('oppdatereOpplysningerLenkeTittel')}
                                description={tekst('oppdatereOpplysningerLenkeBeskrivelse')}
                                onClick={() =>
                                    loggAktivitet({
                                        aktivitet: 'Går til endre personopplysninger',
                                        komponent: 'KvitteringOppgaveUnder18',
                                    })
                                }
                            />
                        </li>
                        <li className={'mb-4'}>
                            <LenkePanel
                                href={tekst('kontaktOssLenke')}
                                title={tekst('kontaktOssLenkeTittel')}
                                description={tekst('kontaktOssLenkeBeskrivelse')}
                                onClick={() =>
                                    loggAktivitet({
                                        aktivitet: 'Går til endre personopplysninger',
                                        komponent: 'KvitteringOppgaveUnder18',
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
