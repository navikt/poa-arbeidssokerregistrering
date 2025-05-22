import { redirect } from 'next/navigation';
import KanIkkeStartePeriodeV2 from '../../components/feilmeldinger/kan-ikke-starte-periode-v2';
import { SkjemaSide } from '../../model/skjema';
import { Suspense } from 'react';
import { Loader } from '@navikt/ds-react';
import { fetchKanStartePeriode } from './api';

async function StartPage() {
    const { error, data } = await fetchKanStartePeriode();
    console.log('I APP ROUTER!!!');

    if (data) {
        redirect(`/opplysninger/${SkjemaSide.DinSituasjon}`);
    }

    return <>{error && <KanIkkeStartePeriodeV2 feilmelding={error.data} />}</>;
}

export default async function Start() {
    return (
        <Suspense
            fallback={
                <div style={{ textAlign: 'center' }}>
                    <Loader variant="neutral" size="2xlarge" title="Forsøker å starte registrering..." />
                </div>
            }
        >
            <StartPage />
        </Suspense>
    );
}
