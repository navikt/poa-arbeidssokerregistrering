import { NextPageProps } from '@/types/next';
import Skjema from '@/app/oppdater-opplysninger/[side]/skjema';
import { fetchArbeidssoekerregisteretSnapshot } from '@/app/oppdater-opplysninger/api';
import { Suspense } from 'react';
import { Loader } from '@navikt/ds-react';
import { mapOpplysningerHendelseTilSkjemaState } from '@navikt/arbeidssokerregisteret-utils';
import HydrateSkjemaState from '@/app/oppdater-opplysninger/[side]/wrapper';
import SettSprakIDekorator from '@/components/sett-sprak-i-dekorator';
import { FeilmeldingGenerell } from '@/components/feilmeldinger/feilmeldinger';
import { redirect } from 'next/navigation';

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

    if (Boolean(data.avsluttet)) {
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
