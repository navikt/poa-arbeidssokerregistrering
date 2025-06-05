import {
    FeilmeldingVedStartAvArbeidssoekerperiodeV2,
    FeilKoderVedStartAvArbeidssoekerperiode,
    ReglerForStartAvArbeidssoekerperiode,
} from '@/model/feilsituasjonTyper';
import { redirect } from 'next/navigation';
import { FeilmeldingGenerell } from '@/components/feilmeldinger/feilmeldinger';

function KanIkkeStartePeriodeV2(props: { feilmelding?: FeilmeldingVedStartAvArbeidssoekerperiodeV2 }) {
    const { feilmelding } = props;
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
        redirect('/veiledning/under-18/');
    } else if (tekniskFeil) {
        redirect('/feil/');
    } else if (manglendeOppholdstillatelse) {
        redirect('/veiledning/oppholdstillatelse/');
    } else {
        redirect('/veiledning/registerdata/');
    }
}

export default KanIkkeStartePeriodeV2;
