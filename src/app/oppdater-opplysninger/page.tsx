import { Suspense } from 'react';
import { Loader } from '@navikt/ds-react';
import { fetchSisteOpplysninger } from '@/app/oppdater-opplysninger/api';
import { SkjemaSide } from '@/model/skjema';
import { redirect } from 'next/navigation';
import { FeilmeldingGenerell } from '@/components/feilmeldinger/feilmeldinger';

async function HentOpplysningerOgSendVidere() {
    const { data, error } = await fetchSisteOpplysninger();
    console.log('data?', data);
    if (error) {
        return <FeilmeldingGenerell />;
    }

    if (!data) {
        redirect('/start');
        return;
    }

    const { periode, opplysninger } = data!;

    if (periode.avsluttet !== null) {
        // avsluttet periode
        return redirect('/start');
    }

    if (opplysninger.opplysningerOmArbeidssoekerId) {
        redirect(`/oppdater-opplysninger/${SkjemaSide.Oppsummering}`);
    } else {
        // ingen eksisterende opplysninger
        redirect(`/oppdater-opplysninger/${SkjemaSide.DinSituasjon}`);
    }
}

export default async function Page() {
    return (
        <Suspense fallback={<Loader size={'xlarge'} />}>
            <HentOpplysningerOgSendVidere />
        </Suspense>
    );
}
