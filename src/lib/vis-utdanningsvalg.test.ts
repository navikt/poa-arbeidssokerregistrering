import visUtdanningsvalg from './vis-utdanningsvalg';
import { Utdanningsnivaa } from '@navikt/arbeidssokerregisteret-utils';
import { SkjemaState } from '../model/skjema';

describe('vis-utdanningsvalg', () => {
    it('returnerer false for INGEN UTDANNING', () => {
        const state: SkjemaState = { utdanning: Utdanningsnivaa.INGEN_UTDANNING };
        expect(visUtdanningsvalg(state)).toBe(false);
    });
    it('returnerer false for GRUNNSKOLE', () => {
        const state: SkjemaState = { utdanning: Utdanningsnivaa.GRUNNSKOLE };
        expect(visUtdanningsvalg(state)).toBe(false);
    });
    it('returnerer true for ingen verdi', () => {
        const state: SkjemaState = {};
        expect(visUtdanningsvalg(state)).toBe(true);
    });
    it('returnerer true for andre utdanningsnivåer', () => {
        [
            Utdanningsnivaa.VIDEREGAENDE_GRUNNUTDANNING,
            Utdanningsnivaa.VIDEREGAENDE_FAGBREV_SVENNEBREV,
            Utdanningsnivaa.HOYERE_UTDANNING_1_TIL_4,
            Utdanningsnivaa.HOYERE_UTDANNING_5_ELLER_MER,
            Utdanningsnivaa.INGEN_SVAR,
        ].forEach((utdanningsnivaa) => {
            const state: SkjemaState = { utdanning: utdanningsnivaa };
            expect(visUtdanningsvalg(state)).toBe(true);
        });
    });
});
