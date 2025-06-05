import { redirect } from 'next/navigation';
import KanIkkeStartePeriodeV2 from '@/components/feilmeldinger/kan-ikke-starte-periode-v2';
import { SkjemaSide } from '@/model/skjema';
import { Suspense } from 'react';
import { Loader } from '@navikt/ds-react';
import { fetchKanStartePeriode } from './api';
import { NextPageProps } from '@/types/next';
import { Sprak } from '@navikt/arbeidssokerregisteret-utils';
import { logger } from '@navikt/next-logger';

async function StartPage({ sprak }: { sprak: Sprak }) {
    const { error, data } = await fetchKanStartePeriode();
    const sprakUrl = sprak === 'nb' ? '' : `/${sprak}`;
    if (data) {
        redirect(`${sprakUrl}/opplysninger/${SkjemaSide.DinSituasjon}`);
    }
    logger.warn(error, 'Feil i startPage');
    return <>{error && <KanIkkeStartePeriodeV2 feilmelding={error.data} />}</>;
}

export default async function Start({ params }: NextPageProps) {
    const lang = (await params).lang;
    const sprak = lang ?? 'nb';
    return (
        <Suspense
            fallback={
                <div style={{ textAlign: 'center' }}>
                    <Loader variant="neutral" size="2xlarge" title="Forsøker å starte registrering..." />
                </div>
            }
        >
            <StartPage sprak={sprak} />
        </Suspense>
    );
}
