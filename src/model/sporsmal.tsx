import { lagHentTekstForSprak, Sprak, SPORSMAL_TEKSTER } from '@navikt/arbeidssokerregisteret-utils';
export function hentTekst(sprak: Sprak, key: string) {
    const tekst = lagHentTekstForSprak(SPORSMAL_TEKSTER, sprak);
    return tekst(key);
}
