import { Snapshot } from '@navikt/arbeidssokerregisteret-utils/oppslag/v3';

export const snapshotMock: Snapshot = {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    identitetsnummer: 'string',
    startet: {
        type: 'PERIODE_STARTET_V1',
        tidspunkt: '2025-12-22T07:24:04.989Z',
        sendtInnAv: {
            utfoertAv: {
                type: 'SLUTTBRUKER',
                id: 'string',
                sikkerhetsnivaa: 'string',
            },
            kilde: 'string',
            aarsak: 'string',
            tidspunktFraKilde: {
                tidspunkt: '2025-12-22T07:24:04.989Z',
                avviksType: 'UKJENT_VERDI',
            },
        },
    },
    // avsluttet: {
    //   type: 'PERIODE_AVSLUTTET_V1',
    //   tidspunkt: '2025-12-22T07:24:04.989Z',
    //   utfoertAv: {
    //     type: 'SLUTTBRUKER',
    //     id: 'string',
    //     sikkerhetsnivaa: 'string',
    //   },
    //   kilde: 'string',
    //   aarsak: 'string',
    //   tidspunktFraKilde: {
    //     tidspunkt: '2025-12-22T07:24:04.989Z',
    //     avviksType: 'UKJENT_VERDI',
    //   },
    // },
    opplysning: {
        type: 'OPPLYSNINGER_V4',
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        sendtInnAv: {
            tidspunkt: '2025-12-22T07:24:04.989Z',
            utfoertAv: {
                type: 'SLUTTBRUKER',
                id: 'string',
                sikkerhetsnivaa: 'string',
            },
            kilde: 'string',
            aarsak: 'string',
            tidspunktFraKilde: {
                tidspunkt: '2025-12-22T07:24:04.989Z',
                avviksType: 'UKJENT_VERDI',
            },
        },
        utdanning: {
            nus: '4',
            bestaatt: 'NEI',
            godkjent: 'VET_IKKE',
        },
        helse: {
            helsetilstandHindrerArbeid: 'NEI',
        },
        jobbsituasjon: {
            beskrivelser: [
                {
                    beskrivelse: 'HAR_BLITT_SAGT_OPP',
                    detaljer: {
                        stilling_styrk08: '8183',
                        stilling: 'Emballasjearbeider hermetikk - frukt, grønnsaker og nøtter',
                    },
                },
            ],
        },
        annet: {
            andreForholdHindrerArbeid: 'JA',
        },
    },
    profilering: {
        type: 'PROFILERING_V1',
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        opplysningerOmArbeidssokerId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        sendtInnAv: {
            tidspunkt: '2025-12-22T07:24:04.989Z',
            utfoertAv: {
                type: 'SLUTTBRUKER',
                id: 'string',
                sikkerhetsnivaa: 'string',
            },
            kilde: 'string',
            aarsak: 'string',
            tidspunktFraKilde: {
                tidspunkt: '2025-12-22T07:24:04.989Z',
                avviksType: 'UKJENT_VERDI',
            },
        },
        profilertTil: 'UKJENT_VERDI',
        jobbetSammenhengendeSeksAvTolvSisteMnd: true,
        alder: 0,
    },
    egenvurdering: {
        type: 'EGENVURDERING_V1',
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        profileringId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        sendtInnAv: {
            tidspunkt: '2025-12-22T07:24:04.989Z',
            utfoertAv: {
                type: 'SLUTTBRUKER',
                id: 'string',
                sikkerhetsnivaa: 'string',
            },
            kilde: 'string',
            aarsak: 'string',
            tidspunktFraKilde: {
                tidspunkt: '2025-12-22T07:24:04.989Z',
                avviksType: 'UKJENT_VERDI',
            },
        },
        profilertTil: 'UKJENT_VERDI',
        egenvurdering: 'ANTATT_BEHOV_FOR_VEILEDNING',
    },
    bekreftelse: {
        type: 'BEKREFTELSE_V1',
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        bekreftelsesloesning: 'UKJENT_VERDI',
        status: 'GYLDIG',
        svar: {
            sendtInnAv: {
                tidspunkt: '2025-12-22T07:24:04.989Z',
                utfoertAv: {
                    type: 'SLUTTBRUKER',
                    id: 'string',
                    sikkerhetsnivaa: 'string',
                },
                kilde: 'string',
                aarsak: 'string',
                tidspunktFraKilde: {
                    tidspunkt: '2025-12-22T07:24:04.989Z',
                    avviksType: 'UKJENT_VERDI',
                },
            },
            gjelderFra: '2025-12-22T07:24:04.989Z',
            gjelderTil: '2025-12-22T07:24:04.989Z',
            harJobbetIDennePerioden: true,
            vilFortsetteSomArbeidssoeker: true,
        },
    },
} as any;
