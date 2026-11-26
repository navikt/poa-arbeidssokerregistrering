import {
    DinSituasjon,
    JaEllerNei,
    SisteStillingValg,
    SporsmalId,
    UtdanningGodkjentValg,
    Utdanningsnivaa,
} from '@navikt/arbeidssokerregisteret-utils';
import byggOpplysningerPayload from './bygg-opplysninger-payload';

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

// Integritetstester: hvert svaralternativ i skjemaet skal havne i payloaden til backend.
// Forventede verdier er skrevet eksplisitt slik at testene også dokumenterer hva som sendes.
describe('integritet: svar i skjemaet havner i payloaden', () => {
    const sisteJobb = { styrk08: '5120', label: 'Kokk', konseptId: 1 };

    test.each([
        [DinSituasjon.MISTET_JOBBEN, 'HAR_BLITT_SAGT_OPP'],
        [DinSituasjon.HAR_SAGT_OPP, 'HAR_SAGT_OPP'],
        [DinSituasjon.DELTIDSJOBB_VIL_MER, 'DELTIDSJOBB_VIL_MER'],
        [DinSituasjon.VIL_BYTTE_JOBB, 'VIL_BYTTE_JOBB'],
        [DinSituasjon.JOBB_OVER_2_AAR, 'IKKE_VAERT_I_JOBB_SISTE_2_AAR'],
        [DinSituasjon.ER_PERMITTERT, 'ER_PERMITTERT'],
        [DinSituasjon.USIKKER_JOBBSITUASJON, 'USIKKER_JOBBSITUASJON'],
        [DinSituasjon.AKKURAT_FULLFORT_UTDANNING, 'AKKURAT_FULLFORT_UTDANNING'],
        [DinSituasjon.VIL_FORTSETTE_I_JOBB, 'ANNET'],
    ])('situasjon %s sendes som %s med siste jobb', (situasjon, beskrivelse) => {
        const result = byggOpplysningerPayload({
            [SporsmalId.dinSituasjon]: situasjon,
            [SporsmalId.sisteJobb]: sisteJobb,
        }).opplysningerOmArbeidssoeker;
        expect(result.jobbsituasjon).toEqual({
            beskrivelser: [{ beskrivelse, detaljer: { stilling: 'Kokk', stilling_styrk08: '5120' } }],
        });
    });

    test('alle situasjoner i skjemaet er dekket av testene over', () => {
        const dekket = [
            'MISTET_JOBBEN',
            'HAR_SAGT_OPP',
            'DELTIDSJOBB_VIL_MER',
            'VIL_BYTTE_JOBB',
            'JOBB_OVER_2_AAR',
            'ER_PERMITTERT',
            'USIKKER_JOBBSITUASJON',
            'AKKURAT_FULLFORT_UTDANNING',
            'VIL_FORTSETTE_I_JOBB',
            'ALDRI_HATT_JOBB',
            'INGEN_SVAR',
            'INGEN_VERDI',
        ];
        expect(Object.values(DinSituasjon).sort()).toEqual(dekket.sort());
    });

    test.each([
        [Utdanningsnivaa.VIDEREGAENDE_GRUNNUTDANNING, '3'],
        [Utdanningsnivaa.VIDEREGAENDE_FAGBREV_SVENNEBREV, '4'],
        [Utdanningsnivaa.HOYERE_UTDANNING_1_TIL_4, '6'],
        [Utdanningsnivaa.HOYERE_UTDANNING_5_ELLER_MER, '7'],
    ])('utdanning %s sendes som nus %s med bestått og godkjent', (utdanning, nus) => {
        for (const bestaatt of [JaEllerNei.JA, JaEllerNei.NEI]) {
            for (const godkjent of [
                UtdanningGodkjentValg.JA,
                UtdanningGodkjentValg.NEI,
                UtdanningGodkjentValg.VET_IKKE,
            ]) {
                const result = byggOpplysningerPayload({
                    [SporsmalId.utdanning]: utdanning,
                    [SporsmalId.utdanningBestatt]: bestaatt,
                    [SporsmalId.utdanningGodkjent]: godkjent,
                }).opplysningerOmArbeidssoeker;
                expect(result.utdanning).toEqual({ nus, bestaatt, godkjent });
            }
        }
    });

    test.each([
        [Utdanningsnivaa.INGEN_UTDANNING, '0'],
        [Utdanningsnivaa.GRUNNSKOLE, '2'],
        [Utdanningsnivaa.INGEN_SVAR, '9'],
    ])('utdanning %s sendes som nus %s uten bestått og godkjent', (utdanning, nus) => {
        const result = byggOpplysningerPayload({ [SporsmalId.utdanning]: utdanning }).opplysningerOmArbeidssoeker;
        expect(result.utdanning).toEqual({ nus });
    });

    test.each([JaEllerNei.JA, JaEllerNei.NEI])('helsehinder %s sendes uendret', (svar) => {
        const result = byggOpplysningerPayload({ [SporsmalId.helseHinder]: svar }).opplysningerOmArbeidssoeker;
        expect(result.helse).toEqual({ helsetilstandHindrerArbeid: svar });
    });

    test.each([JaEllerNei.JA, JaEllerNei.NEI])('andre forhold %s sendes uendret', (svar) => {
        const result = byggOpplysningerPayload({ [SporsmalId.andreForhold]: svar }).opplysningerOmArbeidssoeker;
        expect(result.annet).toEqual({ andreForholdHindrerArbeid: svar });
    });

    test('payloaden inneholder bare opplysningsfelt, ingen identitet', () => {
        const result = byggOpplysningerPayload({
            [SporsmalId.dinSituasjon]: DinSituasjon.HAR_SAGT_OPP,
            [SporsmalId.sisteJobb]: sisteJobb,
            [SporsmalId.utdanning]: Utdanningsnivaa.HOYERE_UTDANNING_1_TIL_4,
            [SporsmalId.utdanningBestatt]: JaEllerNei.JA,
            [SporsmalId.utdanningGodkjent]: UtdanningGodkjentValg.JA,
            [SporsmalId.helseHinder]: JaEllerNei.NEI,
            [SporsmalId.andreForhold]: JaEllerNei.NEI,
        });
        expect(Object.keys(result)).toEqual(['opplysningerOmArbeidssoeker']);
        expect(Object.keys(result.opplysningerOmArbeidssoeker).sort()).toEqual(
            ['annet', 'helse', 'jobbsituasjon', 'utdanning'].sort(),
        );
    });
});
