import type { Sprak } from '@navikt/arbeidssokerregisteret-utils';
import { redirect } from 'next/navigation';
import { FeilmeldingGenerell } from '@/components/feilmeldinger/feilmeldinger';
import { tilSprakUrlIntern } from '@/lib/til-sprak-url';
import {
    FeilKoderVedStartAvArbeidssoekerperiode,
    type FeilmeldingVedStartAvArbeidssoekerperiodeV2,
    ReglerForStartAvArbeidssoekerperiode,
} from '@/model/feilsituasjonTyper';

function KanIkkeStartePeriodeV2(props: { feilmelding?: FeilmeldingVedStartAvArbeidssoekerperiodeV2; sprak: Sprak }) {
    const { feilmelding, sprak } = props;
    if (!feilmelding) return <FeilmeldingGenerell />;

    const { feilKode, aarsakTilAvvisning } = feilmelding;
    const { regler } = aarsakTilAvvisning || {};

    const aarsaker = regler ? regler.map((regel) => regel.id) : [];

    const erUnder18 = aarsaker.includes(ReglerForStartAvArbeidssoekerperiode.UNDER_18_AAR);

    const tekniskFeil =
        [
            FeilKoderVedStartAvArbeidssoekerperiode.FEIL_VED_LESING_AV_FORESPORSEL,
            FeilKoderVedStartAvArbeidssoekerperiode.UKJENT_FEIL,
            FeilKoderVedStartAvArbeidssoekerperiode.UVENTET_FEIL_MOT_EKSTERN_TJENESTE,
            FeilKoderVedStartAvArbeidssoekerperiode.IKKE_TILGANG,
        ].includes(feilKode) ||
        (feilKode === FeilKoderVedStartAvArbeidssoekerperiode.AVVIST &&
            aarsaker.includes(ReglerForStartAvArbeidssoekerperiode.UKJENT_REGEL));

    const manglendeOppholdstillatelse =
        feilKode === FeilKoderVedStartAvArbeidssoekerperiode.AVVIST &&
        aarsaker.includes(ReglerForStartAvArbeidssoekerperiode.IKKE_BOSATT_I_NORGE_I_HENHOLD_TIL_FOLKEREGISTERLOVEN);

    if (erUnder18) {
        redirect(tilSprakUrlIntern('/veiledning/under-18/', sprak));
    } else if (tekniskFeil) {
        redirect(tilSprakUrlIntern('/feil/', sprak));
    } else if (manglendeOppholdstillatelse) {
        redirect(tilSprakUrlIntern('/veiledning/oppholdstillatelse/', sprak));
    } else {
        redirect(tilSprakUrlIntern('/veiledning/generell', sprak));
    }
}

export default KanIkkeStartePeriodeV2;
