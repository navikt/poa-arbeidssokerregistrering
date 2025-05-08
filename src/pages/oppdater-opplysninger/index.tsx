import { withAuthenticatedPage } from '../../auth/withAuthentication';
import useSWRImmutable from 'swr/immutable';
import { Loader } from '@navikt/ds-react';
import Feil from '../feil';
import { ArbeidssokerPeriode, OpplysningerOmArbeidssoker } from '@navikt/arbeidssokerregisteret-utils';
import { useRouter } from 'next/router';
import { SkjemaSide } from '../../model/skjema';
import { fetcher } from '../../lib/api-utils';

export const getServerSideProps = withAuthenticatedPage();
const brukerMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === 'enabled';

const OppdaterOpplysninger = () => {
    const { data, error, isLoading } = useSWRImmutable<{
        periode: ArbeidssokerPeriode;
        opplysninger: OpplysningerOmArbeidssoker;
    }>(brukerMock ? 'api/mocks/hent-siste-opplysninger' : 'api/hent-siste-opplysninger', fetcher);

    const router = useRouter();
    if (isLoading) {
        return <Loader />;
    }

    if (error) {
        return <Feil />;
    }

    if (!data) {
        router.push('/start');
        return;
    }

    const { periode, opplysninger } = data!;

    if (periode.avsluttet !== null) {
        console.info('Avsluttet periode!', periode);
        return router.push('/start');
    }

    if (opplysninger.opplysningerOmArbeidssoekerId) {
        router.push(`/oppdater-opplysninger/${SkjemaSide.Oppsummering}`);
    } else {
        // ingen eksisterende opplysninger
        router.push(`/oppdater-opplysninger/${SkjemaSide.DinSituasjon}`);
    }
};

export default OppdaterOpplysninger;
