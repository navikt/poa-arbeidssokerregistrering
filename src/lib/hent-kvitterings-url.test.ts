import hentKvitteringsUrl from './hent-kvitterings-url';
import { ErrorTypes } from '../model/error';

describe('hent-kvitterings-url', () => {
    it('returnerer "/kvittering/" for responser uten type', () => {
        expect(hentKvitteringsUrl('nb')).toBe('/kvittering/');
    });
});
