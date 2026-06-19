import { lagHentTekstForSprak, type Sprak, type Tekster } from '@navikt/arbeidssokerregisteret-utils';
import { Alert, Button, Link } from '@navikt/ds-react';
import NextLink from 'next/link';
import { redirect } from 'next/navigation';
import DemoPanel from '@/components/forsiden/demo-panel';
import SettSprakIDekorator from '@/components/sett-sprak-i-dekorator';
import { tilSprakUrl } from '@/lib/til-sprak-url';
import { isEnabled } from '@/lib/unleash-is-enabled';
import type { NextPageProps } from '@/types/next';
import unleashKeys from '@/unleash-keys';

const TEKSTER: Tekster<string> = {
    nb: {
        startRegistrering: 'Start registrering',
        informasjon: 'Dette er testsiden for arbeidssøkerregistrering.',
        dolly1: 'Du må ha en testbruker fra',
        dolly2: 'for å kunne gjennomføre en registrering.',
        lenkeIngress: 'Dersom du ønsker å se siden arbeidssøkere møter når de skal registrere seg kan du gå til',
        lenke: 'startsiden for arbeidssøkerregistrering på nav.no',
    },
    nn: {
        startRegistrering: 'Start registrering',
        informasjon: 'Dette er testsida for registrering av arbeidssøkarar.',
        dolly1: 'Du må ha ein testbrukar frå',
        dolly2: 'for å kunne gjennomføre ei registrering.',
        lenkeIngress: 'Dersom du ønskjer å sjå sida arbeidssøkarar møter når dei skal registrere seg, kan du gå til',
        lenke: 'startsida for arbeidssøkarregistrering på nav.no',
    },
    en: {
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
        <div className="flex flex-col gap-4 mb-4">
            <Alert variant="info">
                <div className="flex flex-col gap-4">
                    <div>{tekst('informasjon')}</div>
                    <div>
                        {tekst('dolly1')}{' '}
                        <Link href="https://dolly.ekstern.dev.nav.no" target="_blank" rel="noreferrer">
                            Dolly
                        </Link>{' '}
                        {tekst('dolly2')}
                    </div>
                    <div>
                        {tekst('lenkeIngress')}
                        <Link
                            className="ml-1"
                            href="https://www.nav.no/registrer-arbeidssoker"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {tekst('lenke')}
                        </Link>
                    </div>
                </div>
            </Alert>
            <div className="flex justify-center py-8">
                <NextLink href={tilSprakUrl('/start', sprak)} passHref>
                    <Button>{tekst('startRegistrering')}</Button>
                </NextLink>
            </div>
            <DemoPanel brukerMock={brukerMock} />
        </div>
    );
};

export default async function Home({ params }: NextPageProps) {
    const { lang } = await params;
    const skalRedirecte = await isEnabled(unleashKeys.REDIRECT_FORSIDE);

    if (!brukerMock && skalRedirecte) {
        return redirect(
            tilSprakUrl(process.env.FORSIDE_URL ?? 'https://www.nav.no/registrer-arbeidssoker', lang ?? 'nb'),
        );
    }

    return (
        <>
            <SettSprakIDekorator sprak={lang ?? 'nb'} />
            <DevPage sprak={lang ?? 'nb'} />
        </>
    );
}
