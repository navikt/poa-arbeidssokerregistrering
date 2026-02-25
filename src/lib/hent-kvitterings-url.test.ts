import hentKvitteringsUrl from './hent-kvitterings-url';

describe('hent-kvitterings-url', () => {
    it('returnerer "/kvittering/" for responser uten type', () => {
        expect(hentKvitteringsUrl('nb')).toBe('/kvittering/');
    });
});
