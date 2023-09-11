export interface Periode {
    fraOgMedDato: string;
    tilOgMedDato: string | null;
}

function sorterArbeidssokerperioderSisteForst(a: Periode, b: Periode) {
    const delta = new Date(b.fraOgMedDato).getTime() - new Date(a.fraOgMedDato).getTime();
    if (delta === 0) {
        if (b.tilOgMedDato === null) {
            return 1;
        } else if (a.tilOgMedDato === null) {
            return -1;
        }
    }
    return delta;
}

function harAktivArbeidssokerperiode(perioder: Periode[]) {
    if (perioder.length === 0) {
        return false;
    }

    const sistePeriode = perioder.sort(sorterArbeidssokerperioderSisteForst)[0];
    return sistePeriode.tilOgMedDato === null;
}

export default harAktivArbeidssokerperiode;
