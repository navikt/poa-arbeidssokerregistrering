import { useRouter } from 'next/router';

import {
    FeilmeldingVedStartAvArbeidssoekerperiode,
    FeilKoderVedStartAvArbeidssoekerperiode,
    ReglerForStartAvArbeidssoekerperiode,
} from '../../model/feilsituasjonTyper';

function KanIkkeStartePeriode(props: { feilmelding?: FeilmeldingVedStartAvArbeidssoekerperiode }) {
    const { feilmelding } = props;
    const Router = useRouter();
    if (!feilmelding) return null;
    const { feilKode, aarsakTilAvvisning } = feilmelding;
    const { regel } = aarsakTilAvvisning || {};

    const erUnder18 = regel === ReglerForStartAvArbeidssoekerperiode.UNDER_18_AAR;
    const tekniskFeil =
        [
            FeilKoderVedStartAvArbeidssoekerperiode.FEIL_VED_LESING_AV_FORESPORSEL,
            FeilKoderVedStartAvArbeidssoekerperiode.UKJENT_FEIL,
            FeilKoderVedStartAvArbeidssoekerperiode.UVENTET_FEIL_MOT_EKSTERN_TJENESTE,
            FeilKoderVedStartAvArbeidssoekerperiode.IKKE_TILGANG,
        ].includes(feilKode) ||
        (feilKode === FeilKoderVedStartAvArbeidssoekerperiode.AVVIST &&
            regel === ReglerForStartAvArbeidssoekerperiode.UKJENT_REGEL);
    const manglendeOppholdstillatelse =
        feilKode === FeilKoderVedStartAvArbeidssoekerperiode.AVVIST &&
        regel === ReglerForStartAvArbeidssoekerperiode.IKKE_BOSATT_I_NORGE_I_HENHOLD_TIL_FOLKEREGISTERLOVEN;

    if (erUnder18) {
        Router.push('/veiledning/under-18/');
    } else if (tekniskFeil) {
        Router.push('/veiledning/feil/');
    } else if (manglendeOppholdstillatelse) {
        Router.push('/veiledning/oppholdstillatelse/');
    } else {
        Router.push('/veiledning/registerdata/');
    }

    return null;
}

export default KanIkkeStartePeriode;
