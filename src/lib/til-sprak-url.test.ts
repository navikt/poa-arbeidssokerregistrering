import { tilSprakUrl } from './til-sprak-url';

describe('tilSprakUrl', () => {
    it('returnerer URL uendret for nb', () => {
        expect(tilSprakUrl('https://www.nav.no/arbeid/registrering', 'nb')).toBe(
            'https://www.nav.no/arbeid/registrering',
        );
    });

    it('legger til /nn for nn', () => {
        expect(tilSprakUrl('https://www.nav.no/arbeid/registrering', 'nn')).toBe(
            'https://www.nav.no/arbeid/registrering/nn',
        );
    });

    it('legger til /en for en', () => {
        expect(tilSprakUrl('https://www.nav.no/arbeid/registrering', 'en')).toBe(
            'https://www.nav.no/arbeid/registrering/en',
        );
    });
});
