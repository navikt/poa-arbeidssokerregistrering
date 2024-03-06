import { Alert, BodyLong, GuidePanel } from '@navikt/ds-react';

import { FeilmeldingVedStartAvArbeidssoekerperiode } from '../../model/feilsituasjonTyper';

function KanIkkeStartePeriode(props: { feilmelding?: FeilmeldingVedStartAvArbeidssoekerperiode }) {
    const { feilmelding } = props;
    if (!feilmelding) return null;
    const { feilKode, aarsakTilAvvisning } = feilmelding;
    const { regel, detaljer } = aarsakTilAvvisning || {};
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
