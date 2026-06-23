import { tilSprakUrlEkstern, tilSprakUrlIntern } from './til-sprak-url';

describe('tilSprakUrlEkstern', () => {
    it('returnerer URL uendret for nb', () => {
        expect(tilSprakUrlEkstern('https://www.nav.no/arbeid/registrering', 'nb')).toBe(
            'https://www.nav.no/arbeid/registrering',
        );
    });

    it('legger til /nn for nn', () => {
        expect(tilSprakUrlEkstern('https://www.nav.no/arbeid/registrering', 'nn')).toBe(
            'https://www.nav.no/arbeid/registrering/nn',
        );
    });

    it('legger til /en for en', () => {
        expect(tilSprakUrlEkstern('https://www.nav.no/arbeid/registrering', 'en')).toBe(
            'https://www.nav.no/arbeid/registrering/en',
        );
    });
});

describe('tilSprakUrlIntern', () => {
    it('returnerer URL uendret for nb', () => {
        expect(tilSprakUrlIntern('/start', 'nb')).toBe('/start');
    });

    it('legger til /nn for nn', () => {
        expect(tilSprakUrlIntern('/start', 'nn')).toBe('/nn/start');
    });

    it('legger til /en for en', () => {
        expect(tilSprakUrlIntern('/start', 'en')).toBe('/en/start');
    });
});
