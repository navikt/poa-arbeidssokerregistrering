import { Alert, BodyLong, GuidePanel } from '@navikt/ds-react';
import { useRouter } from 'next/router';

import { FeilmeldingVedStartAvArbeidssoekerperiode } from '../../model/feilsituasjonTyper';

function KanIkkeStartePeriode(props: { feilmelding?: FeilmeldingVedStartAvArbeidssoekerperiode }) {
    const { feilmelding } = props;
    const Router = useRouter();
    if (!feilmelding) return null;
    const { feilKode, aarsakTilAvvisning } = feilmelding;
    const { regel, detaljer } = aarsakTilAvvisning || {};

    const erUnder18 = regel === 'UNDER_18_AAR';

    if (erUnder18) {
        Router.push('/veiledning/under-18/');
    }

    return (
        <GuidePanel poster>
            <Alert variant="error" className="mb-6">
                <BodyLong spacing>{feilKode}</BodyLong>
                <BodyLong>{regel}</BodyLong>
                <BodyLong>{detaljer}</BodyLong>
            </Alert>
            <BodyLong>{JSON.stringify(feilmelding, null, 2)}</BodyLong>
        </GuidePanel>
    );
}

export default KanIkkeStartePeriode;
