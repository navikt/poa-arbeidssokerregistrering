import { Alert, BodyLong, GuidePanel, Panel, Heading, Link, List } from '@navikt/ds-react';
import { useEffect } from 'react';

import useSprak from '../hooks/useSprak';
import { useConfig } from '../contexts/config-context';

import lagHentTekstForSprak, { Tekster } from '../lib/lag-hent-tekst-for-sprak';
import { Config } from '../model/config';
import { loggFlyt, loggSidevisning } from '../lib/amplitude';
import { withAuthenticatedPage } from '../auth/withAuthentication';

import styles from '../styles/skjema.module.css';

const TEKSTER: Tekster<string> = {
    nb: {
        infoTittel: 'Vi kan dessverre ikke registrere deg som arbeidssøker nå',
        infoTekst: 'Vi får ikke til å starte registreringsprosessen for deg',
        merVeiledningTittel: 'Ønsker du mer veiledning?',
        merVeiledningIngress:
            'Hvis du tror du fortsatt er syk etter at sykepengene tar slutt, kan du registrere deg for mer veiledning.',
        merVeiledningVeileder: 'Du kan snakke med veilederen din om mulighetene fremover',
        merVeiledningInformasjon: 'Du får informasjon om du har krav på annen økonomisk støtte',
        merVeiledningGaaTil: 'Jeg vil ha mer veiledning',
        vilDuRegistreresTittel: 'Ønsker du å registrere deg som arbeidssøker?',
        vilDuRegistreresIngress:
            'Hvis du trenger å registrere deg som arbeidssøker så må du kontakte NAV, som hjelper deg videre i prosessen. Si fra at du ikke får registrert deg som arbeidssøker på nav.no så kan vi gjøre endringer slik at du får registrert deg.',
        taKontaktMedNAV: 'Ta kontakt med NAV',
    },
};

const MerOppfolgingSide = () => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const { merOppfolgingUrl } = useConfig() as Config;

    const loggFortsetter = () => {
        loggFlyt({ hendelse: 'Vil registrere seg for mer sykmeldtoppfølging' });
    };

    const loggAvbryter = () => {
        loggFlyt({ hendelse: 'Vil registrere seg som arbeidssøker' });
    };

    useEffect(() => {
        loggSidevisning({ sidetittel: 'Infoside - mer oppfølging' });
    }, []);

    return (
        <div className={styles.merOppfolging}>
            <Alert variant="info" size="medium" className="mb-8">
                <Heading level="1" spacing size="medium">
                    {tekst('infoTittel')}
                </Heading>
                <BodyLong>{tekst('infoTekst')}</BodyLong>
            </Alert>
            <GuidePanel poster className={'mb-8'}>
                <Heading level="1" spacing size="medium">
                    {tekst('merVeiledningTittel')}
                </Heading>
                <BodyLong>{tekst('merVeiledningIngress')}</BodyLong>
                <List as="ul">
                    <List.Item>{tekst('merVeiledningVeileder')}</List.Item>
                    <List.Item>{tekst('merVeiledningInformasjon')}</List.Item>
                </List>
                <a
                    href={merOppfolgingUrl}
                    onClick={() => loggFortsetter()}
                    className="my-8 navds-button navds-button--primary navds-button--medium"
                >
                    {tekst('merVeiledningGaaTil')}
                </a>
            </GuidePanel>
            <Panel>
                <Heading level="1" spacing size="medium">
                    {tekst('vilDuRegistreresTittel')}
                </Heading>
                <BodyLong spacing>{tekst('vilDuRegistreresIngress')}</BodyLong>
                <Link onClick={() => loggAvbryter()} href="https://www.nav.no/kontaktoss" target="_blank">
                    {tekst('taKontaktMedNAV')}
                </Link>
            </Panel>
        </div>
    );
};

export const getServerSideProps = withAuthenticatedPage();
export default MerOppfolgingSide;
