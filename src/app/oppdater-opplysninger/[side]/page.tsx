import { NextPageProps } from '@/types/next';
import Skjema from '@/app/oppdater-opplysninger/[side]/skjema';
import { fetchSisteOpplysninger } from '@/app/oppdater-opplysninger/api';
import { Suspense } from 'react';
import { Loader } from '@navikt/ds-react';
import { mapOpplysningerTilSkjemaState } from '@navikt/arbeidssokerregisteret-utils';
import HydrateSkjemaState from '@/app/oppdater-opplysninger/[side]/wrapper';

async function SkjemaSide({ params }: NextPageProps) {
    const { side } = await params;
    const { data } = await fetchSisteOpplysninger();
    const opplysninger = data?.opplysninger;
    const eksisterendeOpplysninger = opplysninger ? mapOpplysningerTilSkjemaState(opplysninger) : undefined;

    return (
        <>
            <HydrateSkjemaState eksisterendeOpplysninger={eksisterendeOpplysninger} />
            <Skjema aktivSide={side} opplysninger={data?.opplysninger} />
        </>
    );
}

export default async function Page(props: NextPageProps) {
    return (
        <Suspense fallback={<Loader />}>
            <SkjemaSide {...props} />
        </Suspense>
    );
}
