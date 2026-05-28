import { mapOpplysningerHendelseTilSkjemaState } from '@navikt/arbeidssokerregisteret-utils';
import { Loader } from '@navikt/ds-react';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import Skjema from '@/app/oppdater-opplysninger/[side]/skjema';
import HydrateSkjemaState from '@/app/oppdater-opplysninger/[side]/wrapper';
import { fetchArbeidssoekerregisteretSnapshot } from '@/app/oppdater-opplysninger/api';
import { FeilmeldingGenerell } from '@/components/feilmeldinger/feilmeldinger';
import SettSprakIDekorator from '@/components/sett-sprak-i-dekorator';
import type { NextPageProps } from '@/types/next';

async function SkjemaSide({ params }: NextPageProps) {
    const { side, lang } = await params;
    const { data, error } = await fetchArbeidssoekerregisteretSnapshot();

    const sprakUrl = lang === 'nb' ? '' : `/${lang}`;

    if (error) {
        return <FeilmeldingGenerell />;
    }

    if (!data) {
        redirect(`${sprakUrl}/start`);
        return;
    }

    if (data.avsluttet) {
        // avsluttet periode
        return redirect(`${sprakUrl}/start`);
    }

    const eksisterendeOpplysninger = data.opplysning
        ? mapOpplysningerHendelseTilSkjemaState(data.opplysning)
        : undefined;
    return (
        <>
            <HydrateSkjemaState eksisterendeOpplysninger={eksisterendeOpplysninger} />
            <SettSprakIDekorator sprak={lang ?? 'nb'} />
            <Skjema aktivSide={side} />
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
