import { lagHentTekstForSprak, type Sprak, type Tekster } from '@navikt/arbeidssokerregisteret-utils';
import { Alert, BodyShort, Heading, HStack, Link, VStack } from '@navikt/ds-react';
import { PageBlock } from '@navikt/ds-react/Page';
import { redirect } from 'next/navigation';
import StartRegistreringLenke from '@/components/forsiden/start-registrering-lenke';
import SettSprakIDekorator from '@/components/sett-sprak-i-dekorator';
import { tilSprakUrlEkstern, tilSprakUrlIntern } from '@/lib/til-sprak-url';
import { isEnabled } from '@/lib/unleash-is-enabled';
import type { NextPageProps } from '@/types/next';
import unleashKeys from '@/unleash-keys';

const TEKSTER: Tekster<string> = {
    nb: {
        sidetittel: 'Arbeidssøkerregistrering',
        startRegistrering: 'Start registrering',
        informasjon: 'Dette er testsiden for arbeidssøkerregistrering.',
        dolly1: 'Du må ha en testbruker fra',
        dolly2: 'for å kunne gjennomføre en registrering.',
        lenkeIngress: 'Dersom du ønsker å se siden arbeidssøkere møter når de skal registrere seg kan du gå til',
        lenke: 'startsiden for arbeidssøkerregistrering på nav.no',
    },
    nn: {
        sidetittel: 'Arbeidssøkarregistrering',
        startRegistrering: 'Start registrering',
        informasjon: 'Dette er testsida for registrering av arbeidssøkarar.',
        dolly1: 'Du må ha ein testbrukar frå',
        dolly2: 'for å kunne gjennomføre ei registrering.',
        lenkeIngress: 'Dersom du ønskjer å sjå sida arbeidssøkarar møter når dei skal registrere seg, kan du gå til',
        lenke: 'startsida for arbeidssøkarregistrering på nav.no',
    },
    en: {
        sidetittel: 'Job seeker registration',
        startRegistrering: 'Start registration',
        informasjon: 'This is the test page for job seeker registration.',
        dolly1: 'You must have a test user from',
        dolly2: 'to complete a registration.',
        lenkeIngress: 'If you want to see the page job seekers meet when they register, you can go to',
        lenke: 'the front page for job seeker registration at nav.no',
    },
};

const brukerMock = process.env.ENABLE_MOCK === 'enabled';

const DevPage = ({ sprak }: { sprak: Sprak }) => {
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);

    return (
        <PageBlock width="lg">
            <VStack gap="space-16" marginBlock="space-0 space-16" minWidth="0">
                <Heading size="large" level="1" style={{ overflowWrap: 'anywhere' }}>
                    {tekst('sidetittel')}
                </Heading>
                <Alert variant="info" style={{ overflowWrap: 'anywhere' }}>
                    <VStack gap="space-16">
                        <BodyShort>{tekst('informasjon')}</BodyShort>
                        <BodyShort>
                            {tekst('dolly1')}{' '}
                            <Link href="https://dolly.ekstern.dev.nav.no" target="_blank" rel="noreferrer">
                                Dolly
                            </Link>{' '}
                            {tekst('dolly2')}
                        </BodyShort>
                        <BodyShort>
                            {tekst('lenkeIngress')}{' '}
                            <Link href="https://www.nav.no/registrer-arbeidssoker" target="_blank" rel="noreferrer">
                                {tekst('lenke')}
                            </Link>
                        </BodyShort>
                    </VStack>
                </Alert>
                <HStack justify="center" paddingBlock="space-32">
                    <StartRegistreringLenke
                        href={tilSprakUrlIntern('/start', sprak)}
                        tekst={tekst('startRegistrering')}
                    />
                </HStack>
            </VStack>
        </PageBlock>
    );
};

export default async function Home({ params }: NextPageProps) {
    const { lang } = await params;
    const skalRedirecte = await isEnabled(unleashKeys.REDIRECT_FORSIDE);

    if (!brukerMock && skalRedirecte) {
        return redirect(
            tilSprakUrlEkstern(process.env.FORSIDE_URL ?? 'https://www.nav.no/registrer-arbeidssoker', lang ?? 'nb'),
        );
    }

    return (
        <>
            <SettSprakIDekorator sprak={lang ?? 'nb'} />
            <DevPage sprak={lang ?? 'nb'} />
        </>
    );
}
