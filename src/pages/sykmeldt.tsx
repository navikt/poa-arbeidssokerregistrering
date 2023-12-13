import { BodyLong, Button, GuidePanel, Heading, Label, Link } from '@navikt/ds-react';
import NextLink from 'next/link';
import { nanoid } from 'nanoid';
import { GetServerSidePropsContext, NextApiRequest } from 'next';

import useSprak from '../hooks/useSprak';

import lagHentTekstForSprak, { Tekster } from '../lib/lag-hent-tekst-for-sprak';
import VeiledningSvg from '../components/veiledningSvg';
import { SkjemaSide } from '../model/skjema';
import { Kontaktinformasjon } from '../model/kontaktinformasjon';
import { getHeaders, getVeilarbregistreringToken } from '../lib/next-api-handler';
import { loggAktivitet, loggFlyt } from '../lib/amplitude';

import styles from '../styles/skjema.module.css';
import { withAuthenticatedPage } from '../auth/withAuthentication';

const TEKSTER: Tekster<string> = {
    nb: {
        hei: 'Hei, ',
        sykmeldtInformasjon:
            'Vi ser at du er sykmeldt, og at det begynner å nærme seg datoen du ikke lenger kan få sykepenger. Tror du at du snart er tilbake i jobb, eller vil du trenge noe mer fra arbeidsgiveren din eller NAV? Hvis du trenger mer veiledning, må du registrere deg og svare på noen spørsmål.',
        naarRegistrertTittel: 'Når du har registrert deg',
        faaVeiledning: 'får du veiledning om mulighetene dine',
        brukeAktivitetsplan: 'kan du bruke din egen aktivitetsplan',
        kravPaaStotte: 'får du vite om du har krav på annen økonomisk støtte',
        dialogMedVeileder: 'kan du ha dialog med veilederen din',
        registrerDegTittel: 'Registrer deg',
        registrerDegIngress:
            'Når du registrerer deg for å få mer veiledning, skal NAV vurdere hva slags informasjon, veiledning og hjelp du trenger. Du vil derfor få noen spørsmål om situasjonen din slik at du kan få riktig hjelp. Du kan endre på svarene hvis situasjonen din endrer seg. Det er bare veilederen din som kan se hva du har svart. Opplysningene dine blir lagret etter arkivloven. ',
        personopplysningerLenkeTekst: 'Les mer om hvordan NAV behandler personopplysninger.',
        fortsettRegistrering: 'Fortsett registrering',
    },
};

interface SykmeldtProps {
    kontaktinformasjon?: Kontaktinformasjon;
}

const SykmeldtStartside = (props: SykmeldtProps) => {
    const { kontaktinformasjon } = props;
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    const loggFortsetter = () => {
        loggAktivitet({ aktivitet: 'Fortsetter til sykmeldtregistrering' });
        loggFlyt({ hendelse: 'Starter registrering' });
    };

    return (
        <div className={styles.main}>
            <Heading size="medium" spacing level="1">
                Informasjon om registreringen
            </Heading>
            <GuidePanel className={'mb-8'}>
                <Label>
                    {tekst('hei')}
                    {kontaktinformasjon?.navn.fornavn}
                    {'. '}
                </Label>
                {tekst('sykmeldtInformasjon')}
            </GuidePanel>
            <Heading level="2" spacing size="medium">
                {tekst('naarRegistrertTittel')}
            </Heading>
            <div className={'flex items-center justify-center flex-wrap mb-6'}>
                <ul className={'list-disc px-8'}>
                    <li>{tekst('faaVeiledning')}</li>
                    <li>{tekst('brukeAktivitetsplan')}</li>
                    <li>{tekst('kravPaaStotte')}</li>
                    <li>{tekst('dialogMedVeileder')}</li>
                </ul>
                <div className="hidden md:block mb-6">
                    <VeiledningSvg />
                </div>
            </div>
            <Heading level="2" spacing size="medium">
                {tekst('registrerDegTittel')}
            </Heading>
            <BodyLong spacing>
                {tekst('registrerDegIngress')}
                <Link href="https://www.nav.no/personvern" target="_blank">
                    {tekst('personopplysningerLenkeTekst')}
                </Link>
            </BodyLong>
            <NextLink href={`/sykmeldt/${SkjemaSide.SykmeldtFremtidigSituasjon}`} passHref locale={false}>
                <Button onClick={() => loggFortsetter()}>{tekst('fortsettRegistrering')}</Button>
            </NextLink>
        </div>
    );
};

const brukerMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === 'enabled';
export const getServerSideProps = withAuthenticatedPage(async (context: GetServerSidePropsContext) => {
    const kontaktinformasjonUrl = `${process.env.KONTAKTINFORMASJON_URL}`;

    try {
        let callId = nanoid();
        const headers = brukerMock
            ? getHeaders('token', callId)
            : getHeaders(await getVeilarbregistreringToken(context.req as NextApiRequest), callId);
        const response = await fetch(kontaktinformasjonUrl, { headers });

        const kontaktinformasjon = await response.json();
        return {
            props: {
                kontaktinformasjon,
            },
        };
    } catch (e) {
        return {
            props: {},
        };
    }
});

export default SykmeldtStartside;
