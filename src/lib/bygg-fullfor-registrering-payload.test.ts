import byggFullforRegistreringPayload, { aldriJobbet } from './bygg-fullfor-registrering-payload';
import { DinSituasjon, SisteStillingValg, SporsmalId } from '@navikt/arbeidssokerregisteret-utils';

describe('bygg-fullfor-registrering-payload', () => {
    describe('sisteStilling', () => {
        it('returnerer "aldriJobbet" hvis dinSituasjon er aldri har hatt jobb', () => {
            const { sisteStilling } = byggFullforRegistreringPayload({ dinSituasjon: DinSituasjon.ALDRI_HATT_JOBB });
            expect(sisteStilling).toBe(aldriJobbet);
        });

        it('returnerer "aldriJobbet" sisteStilling er HAR_IKKE_HATT_JOBB', () => {
            const { sisteStilling } = byggFullforRegistreringPayload({
                sisteStilling: SisteStillingValg.HAR_IKKE_HATT_JOBB,
            });
            expect(sisteStilling).toBe(aldriJobbet);
        });

        it('returnerer "Ingen yrkeserfaring" når sisteStilling er HAR_IKKE_HATT_JOBB', () => {
            const { teksterForBesvarelse } = byggFullforRegistreringPayload({
                sisteStilling: SisteStillingValg.HAR_IKKE_HATT_JOBB,
            });
            const sisteStillingTekst = teksterForBesvarelse.find(
                (spm) => spm.sporsmalId === SporsmalId.sisteStilling,
            )?.svar;

            expect(sisteStillingTekst).toBe('Ingen yrkeserfaring');
        });

        it('returnerer "Ingen yrkeserfaring" når dinSituasjon er ALDRI_HATT_JOBB', () => {
            const { teksterForBesvarelse } = byggFullforRegistreringPayload({
                dinSituasjon: DinSituasjon.ALDRI_HATT_JOBB,
            });
            const sisteStillingTekst = teksterForBesvarelse.find(
                (spm) => spm.sporsmalId === SporsmalId.sisteStilling,
            )?.svar;

            expect(sisteStillingTekst).toBe('Ingen yrkeserfaring');
        });
        it('returnerer "Ikke oppgitt" når label er tom', () => {
            const { teksterForBesvarelse } = byggFullforRegistreringPayload({
                sisteJobb: { styrk08: '12345', label: '', konseptId: 123 },
            });
            const sisteStillingTekst = teksterForBesvarelse.find(
                (spm) => spm.sporsmalId === SporsmalId.sisteStilling,
            )?.svar;

            expect(sisteStillingTekst).toBe('Ikke oppgitt');
        });
        it('returnerer stillingslabel når den finnes', () => {
            const { teksterForBesvarelse } = byggFullforRegistreringPayload({
                sisteJobb: { styrk08: '12345', label: 'Kokk', konseptId: 123 },
            });
            const sisteStillingTekst = teksterForBesvarelse.find(
                (spm) => spm.sporsmalId === SporsmalId.sisteStilling,
            )?.svar;

            expect(sisteStillingTekst).toBe('Kokk');
        });
        it('sender med spørsmålstekst for siste stilling', () => {
            const { teksterForBesvarelse } = byggFullforRegistreringPayload({
                sisteJobb: { styrk08: 'sdfsd', label: '', konseptId: 123 },
            });
            const sisteStillingSporsmalstekst = teksterForBesvarelse.find(
                (spm) => spm.sporsmalId === SporsmalId.sisteStilling,
            )?.sporsmal;

            expect(sisteStillingSporsmalstekst).toBe('Hva er din siste jobb?');
        });
    });
});
