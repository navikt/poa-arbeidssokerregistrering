import { Suspense } from 'react';
import { Loader } from '@navikt/ds-react';
import { fetchSisteOpplysninger } from '@/app/oppdater-opplysninger/api';
import { SkjemaSide } from '@/model/skjema';
import { redirect } from 'next/navigation';
import { FeilmeldingGenerell } from '@/components/feilmeldinger/feilmeldinger';
import { NextPageProps } from '@/types/next';
import { Sprak } from '@navikt/arbeidssokerregisteret-utils';

async function HentOpplysningerOgSendVidere({ sprak }: { sprak: Sprak }) {
    const { data, error } = await fetchSisteOpplysninger();
    const sprakUrl = sprak === 'nb' ? '' : `/${sprak}`;
    if (error) {
        return <FeilmeldingGenerell />;
    }

    if (!data) {
        redirect(`${sprakUrl}/start`);
        return;
    }

    const { periode, opplysninger } = data!;

    if (periode.avsluttet !== null) {
        // avsluttet periode
        return redirect(`${sprakUrl}/start`);
    }

    if (opplysninger.opplysningerOmArbeidssoekerId) {
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
