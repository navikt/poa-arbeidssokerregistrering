import { describe, it, expect } from 'vitest';

import { personidentTilAlder } from './personident-til-alder';

describe('tester funksjonen personidentTilAlder', () => {
    it('returnerer 52 år på fnr 2301711234', () => {
        const alder = personidentTilAlder('2301711234', '2023-12-08');
        expect(alder).toBe(52);
    });

    it('returnerer 52 år på dnr 6301711234', () => {
        const alder = personidentTilAlder('6301711234', '2023-12-08');
        expect(alder).toBe(52);
    });

    it('returnerer 17 år på fnr 0912051234', () => {
        const alder = personidentTilAlder('0912051234', '2023-12-08');
        expect(alder).toBe(17);
    });

    it('returnerer 18 år på fnr 0812051234', () => {
        const alder = personidentTilAlder('0812051234', '2023-12-08');
        expect(alder).toBe(18);
    });

    it('returnerer 82 år på dnr 6301411234', () => {
        const alder = personidentTilAlder('6301411234', '2023-12-08');
        expect(alder).toBe(82);
    });

    it('returnerer 12 år på dnr 6301111234', () => {
        const alder = personidentTilAlder('6301111234', '2023-12-08');
        expect(alder).toBe(12);
    });
});
