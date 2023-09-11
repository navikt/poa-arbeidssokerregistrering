import harAktivArbeidssokerperiode from './har-aktiv-arbeidssoker-periode';
import harAktivArbeidssokerPeriode from './har-aktiv-arbeidssoker-periode';

describe('har-aktiv-arbeidssoker-periode', () => {
    it('returnerer false ved tom array', () => {
        expect(harAktivArbeidssokerperiode([])).toBe(false);
    });

    it('gir true hvis nyeste periode er åpen', () => {
        expect(harAktivArbeidssokerperiode([{ fraOgMedDato: '2023-09-11', tilOgMedDato: null }])).toBe(true);
    });

    it('funker på usortert liste', () => {
        expect(
            harAktivArbeidssokerPeriode([
                { fraOgMedDato: '2023-08-11', tilOgMedDato: '2023-09-10' },
                { fraOgMedDato: '2023-09-11', tilOgMedDato: null },
            ]),
        );
    });
});
