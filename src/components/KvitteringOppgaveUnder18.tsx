import Head from 'next/head';
import Image from 'next/image';
import virkedager from '@alheimsins/virkedager';
import {
    Alert,
    AlertProps,
    BodyLong,
    BodyShort,
    GuidePanel,
    Heading,
    Link,
    HGrid,
    GlobalAlert,
} from '@navikt/ds-react';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../hooks/useSprak';

import { formaterDato } from '../lib/date-utils';
import { Kontaktinformasjon } from './kontaktinformasjonUnder18';
import { loggAktivitet } from '../lib/tracker';
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
        alertVennligstVent: 'Vennligst vent',
        alleredeBedtOmKontakt:
            'Du har allerede bedt oss kontakte deg. Vi tar kontakt i løpet av to arbeidsdager regnet fra den første meldingen. Pass på at kontaktopplysningene dine er oppdatert ellers kan vi ikke nå deg.',
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
        alertVennligstVent: 'Vent litt',
        alleredeBedtOmKontakt:
            'Du har allereie spurt oss om å kontakte deg. Vi tek kontakt i løpet av to arbeidsdagar rekna frå første melding. Pass på at kontaktopplysningane dine er oppdaterte, slik at vi kan nå tak i deg.',
        kontaktopplysningerOppdatert: 'Kontaktopplysningane dine må vere oppdaterte, slik at vi kan nå tak i deg. ',
        henvendelseMottatt: 'Førespurnad motteken',
        trengerSamtykke:
            'I og med at du er under 18 år, må du ha samtykke frå ein føresett for å kunne registrere deg som arbeidssøkjar. ',
        veilederKontakterDeg: 'En rettleiar hos oss vil kontakte deg innan utgangen av',
        veilederenHjelperDeg: 'Rettleiaren vil hjelpe deg vidare med samtykke og registrering.',
        lesMerOmSamtykkeIntro: 'Du kan lese mer om',
        samtykkeIntroLenkeTekst: 'samtykke fra forestatte på nav.no',
        hvisDuIkkeVilRegistreres:
            'Dersom du ikkje ønskjer å registrere deg som arbeidssøkjar likevel, eller du heller vil snakke med oss på andre måtar enn på telefon,',
        taKontaktMedOss: 'tek du kontakt med oss her.',
        klarteIkkeOppretteHenvendelsen: 'Det var ikkje mogleg å opprette førespurnaden',
        duErUnder18:
            'I og med at du er under 18 år, må du ha samtykke frå ein føresett for å kunne registrere deg som arbeidssøkjar.',
        viHarForsoektOppretteMelding:
            'Vi har forsøkt å sende melding til ein rettleiar som kan hjelpe deg vidare, men det gjekk ikkje.',
        proevSenere: 'Prøv å registrere deg igjen seinare. Dersom feilen varer ved,',
    },
    en: {
        sideTittel: 'You need consent to register as a job seeker',
        tittel: 'You want to register as a job seeker',
        samtykkeLenke: 'https://www.nav.no/samtykke-foresatte',
        samtykkeLenkeTittel: 'Consent from guardians',
        samtykkeLenkeBeskrivelse: 'Read about why we need consent and find a link to the consent form.',
        oppdatereOpplysningerLenke: 'https://www.nav.no/person/personopplysninger/en/#kontaktinformasjon',
        oppdatereOpplysningerLenkeTittel: 'Update your contact information',
        oppdatereOpplysningerLenkeBeskrivelse: 'Check if your contact information is correct.',
        kontaktOssLenke: 'https://www.nav.no/kontaktoss',
        kontaktOssLenkeTittel: 'Contact us',
        kontaktOssLenkeBeskrivelse: 'Contact Nav',
        alertVennligstVent: 'Please wait',
        alleredeBedtOmKontakt:
            'You have already asked us to contact you. We will contact you within two working days counting from the first message. Make sure your contact information is up to date or we will not be able to reach you.',
        kontaktopplysningerOppdatert:
            'Make sure your contact information is up to date or we will not be able to reach you.',
        henvendelseMottatt: 'Enquiry received',
        trengerSamtykke: 'You are under the age of 18, so you need parental consent to register as a jobseeker.',
        veilederKontakterDeg: 'A NAV counsellor will contact you by the end of ',
        veilederenHjelperDeg: 'The counsellor will help you further with consent and registration.',
        lesMerOmSamtykkeIntro: 'Read more about',
        samtykkeIntroLenkeTekst: 'parental consent online at nav.no',
        hvisDuIkkeVilRegistreres:
            'If you do not wish to register as a jobseeker anyway or would rather talk to us in other ways than phone,',
        taKontaktMedOss: 'please contact us here.',
        klarteIkkeOppretteHenvendelsen: 'Failed to create the enquiry',
        duErUnder18: 'You are under the age of 18, so you need parental consent to register as a jobseeker.',
        viHarForsoektOppretteMelding:
            'We tried to create a message to your counsellor who can help you further, but it did not work.',
        proevSenere: 'Try registering again later, but if it continues to fail,',
    },
};

export type Opprettelsesfeil = 'finnesAllerede' | 'opprettelseFeilet';

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
                    <BodyShort spacing>{tekst('body1')}</BodyShort>
                    <BodyLong spacing>{tekst('body2')}</BodyLong>
                    <Heading spacing size={'small'} level={'3'}>
                        {tekst('innholdHeading')}
                    </Heading>
                    <ul className={'list-none'}>
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
