import mapOpplysningerTilSkjemaState from './map-opplysninger-til-skjema-state';
import { SisteStillingValg, SporsmalId, UtdanningGodkjentValg } from '@navikt/arbeidssokerregisteret-utils';
import { map } from 'lodash';
import DinSituasjon from '../components/skjema/din-situasjon';

describe('mapOpplysningerTilSkjemaState', () => {
    test('mapper annet til andreForhold', () => {
        const result = mapOpplysningerTilSkjemaState({
            annet: {
                andreForholdHindrerArbeid: 'JA',
            },
        } as any);
        expect(result.andreForhold).toEqual('JA');
    });

    test('mapper helse', () => {
        const result = mapOpplysningerTilSkjemaState({
            helse: {
                helsetilstandHindrerArbeid: 'JA',
            },
        } as any);
        expect(result.helseHinder).toEqual('JA');
    });

    test('mapper utdanning', () => {
        const result = mapOpplysningerTilSkjemaState({
            utdanning: {
                nus: '6',
                bestaatt: 'JA',
                godkjent: UtdanningGodkjentValg.VET_IKKE,
            },
        } as any);

        expect(result).toMatchObject({
            [SporsmalId.utdanning]: 'HOYERE_UTDANNING_1_TIL_4',
            [SporsmalId.utdanningBestatt]: 'JA',
            [SporsmalId.utdanningGodkjent]: 'VET_IKKE',
        });
    });

    test('mapper din situasjon', () => {
        const result = mapOpplysningerTilSkjemaState({
            jobbsituasjon: [
                {
                    beskrivelse: 'VIL_BYTTE_JOBB',
                    detaljer: {
                        stilling_styrk08: '1234',
                        stilling: 'Test',
                    },
                },
            ],
        } as any);

        expect(result).toMatchObject({
            [SporsmalId.dinSituasjon]: 'VIL_BYTTE_JOBB',
            [SporsmalId.sisteStilling]: SisteStillingValg.INGEN_SVAR,
        });
    });

    describe('sisteStilling', () => {
        test('mapper HAR_IKKE_HATT_JOBB for USIKKER_JOBBSITUASJON', () => {
            const result = mapOpplysningerTilSkjemaState({
                jobbsituasjon: [
                    {
                        beskrivelse: 'USIKKER_JOBBSITUASJON',
                        detaljer: {},
                    },
                ],
            } as any);
            expect(result).toMatchObject({
                [SporsmalId.dinSituasjon]: 'USIKKER_JOBBSITUASJON',
                [SporsmalId.sisteStilling]: SisteStillingValg.HAR_IKKE_HATT_JOBB,
            });
        });
        test('mapper HAR_IKKE_HATT_JOBB for IKKE_VAERT_I_JOBB_SISTE_2_AAR', () => {
            const result = mapOpplysningerTilSkjemaState({
                jobbsituasjon: [
                    {
                        beskrivelse: 'IKKE_VAERT_I_JOBB_SISTE_2_AAR',
                        detaljer: {},
                    },
                ],
            } as any);
            expect(result).toMatchObject({
                [SporsmalId.dinSituasjon]: 'JOBB_OVER_2_AAR',
                [SporsmalId.sisteStilling]: SisteStillingValg.HAR_IKKE_HATT_JOBB,
            });
        });
        test('mapper HAR_IKKE_HATT_JOBB for AKKURAT_FULLFORT_UTDANNING', () => {
            const result = mapOpplysningerTilSkjemaState({
                jobbsituasjon: [
                    {
                        beskrivelse: 'AKKURAT_FULLFORT_UTDANNING',
                        detaljer: {},
                    },
                ],
            } as any);
            expect(result).toMatchObject({
                [SporsmalId.dinSituasjon]: 'AKKURAT_FULLFORT_UTDANNING',
                [SporsmalId.sisteStilling]: SisteStillingValg.HAR_IKKE_HATT_JOBB,
            });
        });
        test('mapper HAR_HATT_JOBB for USIKKER_JOBBSITUASJON', () => {
            const result = mapOpplysningerTilSkjemaState({
                jobbsituasjon: [
                    {
                        beskrivelse: 'USIKKER_JOBBSITUASJON',
                        detaljer: { stilling: 'Trailersjåfør', stilling_styrk08: '42' },
                    },
                ],
            } as any);
            expect(result).toMatchObject({
                [SporsmalId.dinSituasjon]: 'USIKKER_JOBBSITUASJON',
                [SporsmalId.sisteStilling]: SisteStillingValg.HAR_HATT_JOBB,
            });
        });
    });
    test('mapper sisteJobb', () => {
        const result = mapOpplysningerTilSkjemaState({
            jobbsituasjon: [
                {
                    beskrivelse: 'VIL_BYTTE_JOBB',
                    detaljer: {
                        stilling_styrk08: '1234',
                        stilling: 'Test',
                    },
                },
            ],
        } as any);

        expect(result.sisteJobb).toMatchObject({
            label: 'Test',
            styrk08: '1234',
            konseptId: '-1',
        });
    });
    test('defaulter sisteJobb til "Annen stilling"', () => {
        const result = mapOpplysningerTilSkjemaState({
            jobbsituasjon: [
                {
                    beskrivelse: 'AKKURAT_FULLFORT_UTDANNING',
                    detaljer: {},
                },
            ],
        } as any);
        expect(result.sisteJobb).toMatchObject({
            label: 'Annen stilling',
            styrk08: '-1',
            konseptId: '-1',
        });
    });
});
