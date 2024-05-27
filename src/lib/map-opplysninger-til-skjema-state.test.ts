import mapOpplysningerTilSkjemaState from './map-opplysninger-til-skjema-state';
import { SporsmalId, UtdanningGodkjentValg } from '@navikt/arbeidssokerregisteret-utils';

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
                helseTilstandHindrerArbeid: 'JA',
            },
        } as any);
        expect(result.helseHinder).toEqual('JA');
    });

    test('mapper utdanning', () => {
        const result = mapOpplysningerTilSkjemaState({
            utdanning: {
                nus: '6',
                bestaatt: 'JA' as any,
                godkjent: UtdanningGodkjentValg.VET_IKKE,
            },
        } as any);

        expect(result).toMatchObject({
            [SporsmalId.utdanning]: 'HOYERE_UTDANNING_1_TIL_4',
            [SporsmalId.utdanningBestatt]: 'JA',
            [SporsmalId.utdanningGodkjent]: 'VET_IKKE',
        });
    });

    // test('mapper din situasjon', () => {
    //     const result = mapOpplysningerTilSkjemaState({
    //         jobbsituasjon: [{
    //             beskrivelse: 'VIL_BYTTE_JOBB',
    //             detaljer: {styrk08 : '1234', stilling: 'Test'}
    //         }
    //         ]
    //
    //     }
    // },
});
