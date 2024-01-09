export type SisteArbeidsforhold = {
    styrk: string;
};

function datoSorteringStartdato(a: any, b: any) {
    return new Date(b.startdato).getTime() - new Date(a.startdato).getTime();
}

function datoSorteringSluttdato(a: any, b: any) {
    return new Date(b.sluttdato).getTime() - new Date(a.sluttdato).getTime();
}

export function hentSisteArbeidsForhold(data: any): SisteArbeidsforhold {
    const { arbeidsforholdoversikter } = data;
    const aapneArbeidsforhold = arbeidsforholdoversikter.filter((forhold: any) => !forhold.sluttdato);
    const gjeldendeArbeidsforhold = aapneArbeidsforhold ? aapneArbeidsforhold.sort(datoSorteringStartdato)[0] : null;
    const senesteAvsluttede = arbeidsforholdoversikter
        .filter((forhold: any) => !!forhold.sluttdato)
        .sort(datoSorteringSluttdato)[0];

    const sisteArbeidsforhold = gjeldendeArbeidsforhold || senesteAvsluttede;

    return {
        styrk: sisteArbeidsforhold.yrke.kode,
    };
}
