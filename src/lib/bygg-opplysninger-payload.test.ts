import byggOpplysningerPayload from './bygg-opplysninger-payload';
import {
    DinSituasjon,
    JaEllerNei,
    SisteStillingValg,
    SporsmalId,
    UtdanningGodkjentValg,
    Utdanningsnivaa,
} from '@navikt/arbeidssokerregisteret-utils';

describe('bygg-opplysninger-payload', () => {
    describe('utdanning', () => {
        test('mapper til nus-kode, godkjent, bestatt', () => {
            const result = byggOpplysningerPayload({
                [SporsmalId.utdanning]: Utdanningsnivaa.HOYERE_UTDANNING_1_TIL_4,
                [SporsmalId.utdanningBestatt]: JaEllerNei.JA,
                [SporsmalId.utdanningGodkjent]: UtdanningGodkjentValg.VET_IKKE,
            }).opplysningerOmArbeidssoeker;
            expect(result.utdanning).toEqual({
                nus: '6',
                bestaatt: 'JA',
                godkjent: 'VET_IKKE',
            });
        });
        test('dropper godkjent og bestatt når ingen utdanning', () => {
            const result = byggOpplysningerPayload({
                [SporsmalId.utdanning]: Utdanningsnivaa.INGEN_UTDANNING,
                [SporsmalId.utdanningBestatt]: JaEllerNei.JA,
                [SporsmalId.utdanningGodkjent]: UtdanningGodkjentValg.VET_IKKE,
            }).opplysningerOmArbeidssoeker;
            expect(result.utdanning).toEqual({
                nus: '0',
            });
        });
        test('dropper godkjent og bestatt når grunnskole', () => {
            const result = byggOpplysningerPayload({
                [SporsmalId.utdanning]: Utdanningsnivaa.GRUNNSKOLE,
                [SporsmalId.utdanningBestatt]: JaEllerNei.JA,
                [SporsmalId.utdanningGodkjent]: UtdanningGodkjentValg.VET_IKKE,
            }).opplysningerOmArbeidssoeker;
            expect(result.utdanning).toEqual({
                nus: '2',
            });
        });
        test('defaulter til nus-kode ingen svar', () => {
            const result = byggOpplysningerPayload({}).opplysningerOmArbeidssoeker;
            expect(result.utdanning).toEqual({
                nus: '9',
            });
        });
    });

    describe('jobbsituasjon', () => {
        test('dropper detaljer ved HAR_IKKE_HATT_JOBB', () => {
            const result = byggOpplysningerPayload({
                [SporsmalId.dinSituasjon]: DinSituasjon.ALDRI_HATT_JOBB,
            }).opplysningerOmArbeidssoeker;
            expect(result.jobbsituasjon).toEqual({
                beskrivelser: [{ beskrivelse: 'ALDRI_HATT_JOBB' }],
            });
        });
        test('dropper detaljer ved ALDRI_HATT_JOBB', () => {
            const result = byggOpplysningerPayload({
                [SporsmalId.dinSituasjon]: DinSituasjon.AKKURAT_FULLFORT_UTDANNING,
                [SporsmalId.sisteStilling]: SisteStillingValg.HAR_IKKE_HATT_JOBB,
            }).opplysningerOmArbeidssoeker;
            expect(result.jobbsituasjon).toEqual({
                beskrivelser: [{ beskrivelse: 'AKKURAT_FULLFORT_UTDANNING' }],
            });
        });

        test('legger med styrk-kode i detaljer', () => {
            const result = byggOpplysningerPayload({
                [SporsmalId.dinSituasjon]: DinSituasjon.HAR_SAGT_OPP,
                [SporsmalId.sisteJobb]: {
                    styrk08: '42',
                    label: 'Bartender',
                    konseptId: 0,
                },
            }).opplysningerOmArbeidssoeker;
            expect(result.jobbsituasjon).toEqual({
                beskrivelser: [
                    {
                        beskrivelse: 'HAR_SAGT_OPP',
                        detaljer: {
                            stilling: 'Bartender',
                            stilling_styrk08: '42',
                        },
                    },
                ],
            });
        });

        test('erstatter styrk-kode -1 med 00', () => {
            const result = byggOpplysningerPayload({
                [SporsmalId.dinSituasjon]: DinSituasjon.HAR_SAGT_OPP,
                [SporsmalId.sisteJobb]: {
                    styrk08: '-1',
                    label: 'Uoppgitt',
                    konseptId: 0,
                },
            }).opplysningerOmArbeidssoeker;
            expect(result.jobbsituasjon).toEqual({
                beskrivelser: [
                    {
                        beskrivelse: 'HAR_SAGT_OPP',
                        detaljer: {
                            stilling: 'Uoppgitt',
                            stilling_styrk08: '00',
                        },
                    },
                ],
            });
        });

        test('mapper om MISTET_JOBBEN', () => {
            const result = byggOpplysningerPayload({
                [SporsmalId.dinSituasjon]: DinSituasjon.MISTET_JOBBEN,
            }).opplysningerOmArbeidssoeker;
            expect(result.jobbsituasjon.beskrivelser[0].beskrivelse).toEqual('HAR_BLITT_SAGT_OPP');
        });
        test('mapper om JOBB_OVER_2_AAR', () => {
            const result = byggOpplysningerPayload({
                [SporsmalId.dinSituasjon]: DinSituasjon.JOBB_OVER_2_AAR,
            }).opplysningerOmArbeidssoeker;
            expect(result.jobbsituasjon.beskrivelser[0].beskrivelse).toEqual('IKKE_VAERT_I_JOBB_SISTE_2_AAR');
        });
        test('mapper om VIL_FORTSETTE_I_JOBB', () => {
            const result = byggOpplysningerPayload({
                [SporsmalId.dinSituasjon]: DinSituasjon.VIL_FORTSETTE_I_JOBB,
            }).opplysningerOmArbeidssoeker;
            expect(result.jobbsituasjon.beskrivelser[0].beskrivelse).toEqual('ANNET');
        });
        test('mapper om INGEN_SVAR', () => {
            const result = byggOpplysningerPayload({
                [SporsmalId.dinSituasjon]: DinSituasjon.INGEN_SVAR,
            }).opplysningerOmArbeidssoeker;
            expect(result.jobbsituasjon.beskrivelser[0].beskrivelse).toEqual('UDEFINERT');
        });
        test('mapper om INGEN_VERDI', () => {
            const result = byggOpplysningerPayload({
                [SporsmalId.dinSituasjon]: DinSituasjon.INGEN_VERDI,
            }).opplysningerOmArbeidssoeker;
            expect(result.jobbsituasjon.beskrivelser[0].beskrivelse).toEqual('UDEFINERT');
        });
    });

    test('mapper skjema-state til payload', () => {
        const result = byggOpplysningerPayload({
            [SporsmalId.utdanning]: Utdanningsnivaa.INGEN_UTDANNING,
            [SporsmalId.utdanningBestatt]: JaEllerNei.JA,
            [SporsmalId.utdanningGodkjent]: UtdanningGodkjentValg.VET_IKKE,
            [SporsmalId.helseHinder]: JaEllerNei.NEI,
            [SporsmalId.dinSituasjon]: DinSituasjon.ALDRI_HATT_JOBB,
        });

        expect(result.opplysningerOmArbeidssoeker).toEqual({
            utdanning: {
                nus: '0',
            },
            helse: {
                helsetilstandHindrerArbeid: 'NEI',
            },
            jobbsituasjon: {
                beskrivelser: [{ beskrivelse: 'ALDRI_HATT_JOBB' }],
            },
        });
    });
});
