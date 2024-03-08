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
                [SporsmalId.dinSituasjon]: DinSituasjon.VIL_FORTSETTE_I_JOBB,
                [SporsmalId.sisteJobb]: {
                    styrk08: '42',
                    label: 'Bartender',
                    konseptId: 0,
                },
            }).opplysningerOmArbeidssoeker;
            expect(result.jobbsituasjon).toEqual({
                beskrivelser: [
                    {
                        beskrivelse: 'VIL_FORTSETTE_I_JOBB',
                        detaljer: {
                            stilling: 'Bartender',
                            stilling_styrk08: '42',
                        },
                    },
                ],
            });
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
