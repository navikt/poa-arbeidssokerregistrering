import type { Sprak } from '@navikt/arbeidssokerregisteret-utils';
import { Loader } from '@navikt/ds-react';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { fetchArbeidssoekerregisteretSnapshot } from '@/app/oppdater-opplysninger/api';
import { FeilmeldingGenerell } from '@/components/feilmeldinger/feilmeldinger';
import { SkjemaSide } from '@/model/skjema';
import type { NextPageProps } from '@/types/next';

async function HentOpplysningerOgSendVidere({ sprak }: { sprak: Sprak }) {
    const { data, error } = await fetchArbeidssoekerregisteretSnapshot();
    const sprakUrl = sprak === 'nb' ? '' : `/${sprak}`;
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

    if (data.opplysning?.id) {
        redirect(`${sprakUrl}/oppdater-opplysninger/${SkjemaSide.Oppsummering}`);
    } else {
        // ingen eksisterende opplysninger
        redirect(`${sprakUrl}/oppdater-opplysninger/${SkjemaSide.DinSituasjon}`);
    }
}

export default async function Page({ params }: NextPageProps) {
    const sprak = (await params).lang ?? 'nb';
    return (
        <Suspense fallback={<Loader size={'xlarge'} />}>
            <HentOpplysningerOgSendVidere sprak={sprak} />
        </Suspense>
    );
}
