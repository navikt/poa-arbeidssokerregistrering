import { hentSisteArbeidsForhold } from './hent-siste-arbeidsforhold';

describe('tester funksjonen for å hente siste arbeidsforhold', () => {
    test('returnerer 1233101 som styrk på siste arbeidsforhold når det er flere uavsluttede', () => {
        const { styrk } = hentSisteArbeidsForhold(responseDataMedUavsluttede);
        expect(styrk).toBe('1233101');
    });

    test('returnerer 6411104 som styrk på siste arbeidsforhold når alle er avsluttet', () => {
        const { styrk } = hentSisteArbeidsForhold(responseDataMedKunAvsluttede);
        expect(styrk).toBe('6411104');
    });
});

const responseDataMedKunAvsluttede = {
    arbeidsforholdoversikter: [
        {
            type: {
                kode: 'ordinaertArbeidsforhold',
                beskrivelse: 'Ordinært arbeidsforhold',
            },
            arbeidstaker: {
                identer: [
                    {
                        type: 'AKTORID',
                        ident: '2175141353812',
                        gjeldende: true,
                    },
                    {
                        type: 'FOLKEREGISTERIDENT',
                        ident: '30063000562',
                        gjeldende: true,
                    },
                ],
            },
            arbeidssted: {
                type: 'Underenhet',
                identer: [
                    {
                        type: 'ORGANISASJONSNUMMER',
                        ident: '910825518',
                    },
                ],
            },
            opplysningspliktig: {
                type: 'Hovedenhet',
                identer: [
                    {
                        type: 'ORGANISASJONSNUMMER',
                        ident: '810825472',
                    },
                ],
            },
            startdato: '2014-01-01',
            sluttdato: '2019-01-03',
            yrke: {
                kode: '1231119',
                beskrivelse: 'KONTORLEDER',
            },
            avtaltStillingsprosent: 100,
            permisjonsprosent: 50,
            permitteringsprosent: 50,
            rapporteringsordning: {
                kode: 'a-ordningen',
                beskrivelse: 'Rapportert via a-ordningen (2015-d.d.)',
            },
            navArbeidsforholdId: 12345,
            sistBekreftet: '2020-09-15T08:19:53',
        },
        {
            type: {
                kode: 'maritimtArbeidsforhold',
                beskrivelse: 'Maritimt arbeidsforhold',
            },
            arbeidstaker: {
                identer: [
                    {
                        type: 'AKTORID',
                        ident: '2175141353812',
                        gjeldende: true,
                    },
                    {
                        type: 'FOLKEREGISTERIDENT',
                        ident: '30063000562',
                        gjeldende: true,
                    },
                ],
            },
            arbeidssted: {
                type: 'Underenhet',
                identer: [
                    {
                        type: 'ORGANISASJONSNUMMER',
                        ident: '896929119',
                    },
                ],
            },
            opplysningspliktig: {
                type: 'Hovedenhet',
                identer: [
                    {
                        type: 'ORGANISASJONSNUMMER',
                        ident: '928497704',
                    },
                ],
            },
            startdato: '2012-03-15',
            sluttdato: '2024-01-08',
            yrke: {
                kode: '6411104',
                beskrivelse: 'FISKER',
            },
            avtaltStillingsprosent: 100,
            rapporteringsordning: {
                kode: 'a-ordningen',
                beskrivelse: 'Rapportert via a-ordningen (2015-d.d.)',
            },
            navArbeidsforholdId: 23456,
            sistBekreftet: '2021-01-01T19:25:17',
        },
        {
            type: {
                kode: 'forenkletOppgjoersordning',
                beskrivelse: 'Forenklet oppgjørsordning',
            },
            arbeidstaker: {
                identer: [
                    {
                        type: 'AKTORID',
                        ident: '2175141353812',
                        gjeldende: true,
                    },
                    {
                        type: 'FOLKEREGISTERIDENT',
                        ident: '30063000562',
                        gjeldende: true,
                    },
                ],
            },
            arbeidssted: {
                type: 'Person',
                identer: [
                    {
                        type: 'AKTORID',
                        ident: '2005579084646',
                        gjeldende: true,
                    },
                    {
                        type: 'FOLKEREGISTERIDENT',
                        ident: '19095901754',
                        gjeldende: true,
                    },
                ],
            },
            opplysningspliktig: {
                type: 'Person',
                identer: [
                    {
                        type: 'AKTORID',
                        ident: '2005579084646',
                        gjeldende: true,
                    },
                    {
                        type: 'FOLKEREGISTERIDENT',
                        ident: '19095901754',
                        gjeldende: true,
                    },
                ],
            },
            startdato: '2020-01-01',
            sluttdato: '2020-01-03',
            yrke: {
                kode: '9120105',
                beskrivelse: 'ALTMULIGMANN (PRIVATHJEM)',
            },
            rapporteringsordning: {
                kode: 'a-ordningen',
                beskrivelse: 'Rapportert via a-ordningen (2015-d.d.)',
            },
            navArbeidsforholdId: 34567,
            sistBekreftet: '2020-06-10T11:03:47',
        },
        {
            type: {
                kode: 'frilanserOppdragstakerHonorarPersonerMm',
                beskrivelse:
                    'Frilansere/oppdragstakere, styremedlemmer, folkevalgte, personer som innehar tillitsverv, fosterforelder, støttekontakter, avlastere og personer med omsorgslønn',
            },
            arbeidstaker: {
                identer: [
                    {
                        type: 'AKTORID',
                        ident: '2175141353812',
                        gjeldende: true,
                    },
                    {
                        type: 'FOLKEREGISTERIDENT',
                        ident: '30063000562',
                        gjeldende: true,
                    },
                ],
            },
            arbeidssted: {
                type: 'Underenhet',
                identer: [
                    {
                        type: 'ORGANISASJONSNUMMER',
                        ident: '824771332',
                    },
                ],
            },
            opplysningspliktig: {
                type: 'Hovedenhet',
                identer: [
                    {
                        type: 'ORGANISASJONSNUMMER',
                        ident: '928497704',
                    },
                ],
            },
            startdato: '2020-01-01',
            sluttdato: '2021-04-30',
            yrke: {
                kode: '1210160',
                beskrivelse: 'STYREMEDLEM',
            },
            avtaltStillingsprosent: 0,
            rapporteringsordning: {
                kode: 'a-ordningen',
                beskrivelse: 'Rapportert via a-ordningen (2015-d.d.)',
            },
            navArbeidsforholdId: 56789,
            sistBekreftet: '2020-06-10T11:03:47',
        },
        {
            type: {
                kode: 'ordinaertArbeidsforhold',
                beskrivelse: 'Ordinært arbeidsforhold',
            },
            arbeidstaker: {
                identer: [
                    {
                        type: 'AKTORID',
                        ident: '2175141353812',
                        gjeldende: true,
                    },
                    {
                        type: 'FOLKEREGISTERIDENT',
                        ident: '30063000562',
                        gjeldende: true,
                    },
                ],
            },
            arbeidssted: {
                type: 'Underenhet',
                identer: [
                    {
                        type: 'ORGANISASJONSNUMMER',
                        ident: '972674818',
                    },
                ],
            },
            opplysningspliktig: {
                type: 'Hovedenhet',
                identer: [
                    {
                        type: 'ORGANISASJONSNUMMER',
                        ident: '928497704',
                    },
                ],
            },
            startdato: '2020-01-01',
            sluttdato: '2020-01-03',
            yrke: {
                kode: '1233101',
                beskrivelse: 'ABONNEMENTSJEF',
            },
            avtaltStillingsprosent: 100,
            varsler: [
                {
                    entitet: 'Arbeidsforhold',
                    varslingskode: {
                        kode: 'AFIDHI',
                        beskrivelse: 'Arbeidsforholdet har id-historikk',
                    },
                },
            ],
            rapporteringsordning: {
                kode: 'a-ordningen',
                beskrivelse: 'Rapportert via a-ordningen (2015-d.d.)',
            },
            navArbeidsforholdId: 45678,
            sistBekreftet: '2020-07-28T09:10:19',
        },
    ],
    totalAntall: 5,
};

const responseDataMedUavsluttede = {
    arbeidsforholdoversikter: [
        {
            type: {
                kode: 'ordinaertArbeidsforhold',
                beskrivelse: 'Ordinært arbeidsforhold',
            },
            arbeidstaker: {
                identer: [
                    {
                        type: 'AKTORID',
                        ident: '2175141353812',
                        gjeldende: true,
                    },
                    {
                        type: 'FOLKEREGISTERIDENT',
                        ident: '30063000562',
                        gjeldende: true,
                    },
                ],
            },
            arbeidssted: {
                type: 'Underenhet',
                identer: [
                    {
                        type: 'ORGANISASJONSNUMMER',
                        ident: '910825518',
                    },
                ],
            },
            opplysningspliktig: {
                type: 'Hovedenhet',
                identer: [
                    {
                        type: 'ORGANISASJONSNUMMER',
                        ident: '810825472',
                    },
                ],
            },
            startdato: '2014-01-01',
            yrke: {
                kode: '1231119',
                beskrivelse: 'KONTORLEDER',
            },
            avtaltStillingsprosent: 100,
            permisjonsprosent: 50,
            permitteringsprosent: 50,
            rapporteringsordning: {
                kode: 'a-ordningen',
                beskrivelse: 'Rapportert via a-ordningen (2015-d.d.)',
            },
            navArbeidsforholdId: 12345,
            sistBekreftet: '2020-09-15T08:19:53',
        },
        {
            type: {
                kode: 'maritimtArbeidsforhold',
                beskrivelse: 'Maritimt arbeidsforhold',
            },
            arbeidstaker: {
                identer: [
                    {
                        type: 'AKTORID',
                        ident: '2175141353812',
                        gjeldende: true,
                    },
                    {
                        type: 'FOLKEREGISTERIDENT',
                        ident: '30063000562',
                        gjeldende: true,
                    },
                ],
            },
            arbeidssted: {
                type: 'Underenhet',
                identer: [
                    {
                        type: 'ORGANISASJONSNUMMER',
                        ident: '896929119',
                    },
                ],
            },
            opplysningspliktig: {
                type: 'Hovedenhet',
                identer: [
                    {
                        type: 'ORGANISASJONSNUMMER',
                        ident: '928497704',
                    },
                ],
            },
            startdato: '2012-03-15',
            yrke: {
                kode: '6411104',
                beskrivelse: 'FISKER',
            },
            avtaltStillingsprosent: 100,
            rapporteringsordning: {
                kode: 'a-ordningen',
                beskrivelse: 'Rapportert via a-ordningen (2015-d.d.)',
            },
            navArbeidsforholdId: 23456,
            sistBekreftet: '2021-01-01T19:25:17',
        },
        {
            type: {
                kode: 'forenkletOppgjoersordning',
                beskrivelse: 'Forenklet oppgjørsordning',
            },
            arbeidstaker: {
                identer: [
                    {
                        type: 'AKTORID',
                        ident: '2175141353812',
                        gjeldende: true,
                    },
                    {
                        type: 'FOLKEREGISTERIDENT',
                        ident: '30063000562',
                        gjeldende: true,
                    },
                ],
            },
            arbeidssted: {
                type: 'Person',
                identer: [
                    {
                        type: 'AKTORID',
                        ident: '2005579084646',
                        gjeldende: true,
                    },
                    {
                        type: 'FOLKEREGISTERIDENT',
                        ident: '19095901754',
                        gjeldende: true,
                    },
                ],
            },
            opplysningspliktig: {
                type: 'Person',
                identer: [
                    {
                        type: 'AKTORID',
                        ident: '2005579084646',
                        gjeldende: true,
                    },
                    {
                        type: 'FOLKEREGISTERIDENT',
                        ident: '19095901754',
                        gjeldende: true,
                    },
                ],
            },
            startdato: '2020-01-01',
            sluttdato: '2020-01-03',
            yrke: {
                kode: '9120105',
                beskrivelse: 'ALTMULIGMANN (PRIVATHJEM)',
            },
            rapporteringsordning: {
                kode: 'a-ordningen',
                beskrivelse: 'Rapportert via a-ordningen (2015-d.d.)',
            },
            navArbeidsforholdId: 34567,
            sistBekreftet: '2020-06-10T11:03:47',
        },
        {
            type: {
                kode: 'frilanserOppdragstakerHonorarPersonerMm',
                beskrivelse:
                    'Frilansere/oppdragstakere, styremedlemmer, folkevalgte, personer som innehar tillitsverv, fosterforelder, støttekontakter, avlastere og personer med omsorgslønn',
            },
            arbeidstaker: {
                identer: [
                    {
                        type: 'AKTORID',
                        ident: '2175141353812',
                        gjeldende: true,
                    },
                    {
                        type: 'FOLKEREGISTERIDENT',
                        ident: '30063000562',
                        gjeldende: true,
                    },
                ],
            },
            arbeidssted: {
                type: 'Underenhet',
                identer: [
                    {
                        type: 'ORGANISASJONSNUMMER',
                        ident: '824771332',
                    },
                ],
            },
            opplysningspliktig: {
                type: 'Hovedenhet',
                identer: [
                    {
                        type: 'ORGANISASJONSNUMMER',
                        ident: '928497704',
                    },
                ],
            },
            startdato: '2020-01-01',
            sluttdato: '2021-04-30',
            yrke: {
                kode: '1210160',
                beskrivelse: 'STYREMEDLEM',
            },
            avtaltStillingsprosent: 0,
            rapporteringsordning: {
                kode: 'a-ordningen',
                beskrivelse: 'Rapportert via a-ordningen (2015-d.d.)',
            },
            navArbeidsforholdId: 56789,
            sistBekreftet: '2020-06-10T11:03:47',
        },
        {
            type: {
                kode: 'ordinaertArbeidsforhold',
                beskrivelse: 'Ordinært arbeidsforhold',
            },
            arbeidstaker: {
                identer: [
                    {
                        type: 'AKTORID',
                        ident: '2175141353812',
                        gjeldende: true,
                    },
                    {
                        type: 'FOLKEREGISTERIDENT',
                        ident: '30063000562',
                        gjeldende: true,
                    },
                ],
            },
            arbeidssted: {
                type: 'Underenhet',
                identer: [
                    {
                        type: 'ORGANISASJONSNUMMER',
                        ident: '972674818',
                    },
                ],
            },
            opplysningspliktig: {
                type: 'Hovedenhet',
                identer: [
                    {
                        type: 'ORGANISASJONSNUMMER',
                        ident: '928497704',
                    },
                ],
            },
            startdato: '2020-01-01',
            yrke: {
                kode: '1233101',
                beskrivelse: 'ABONNEMENTSJEF',
            },
            avtaltStillingsprosent: 100,
            varsler: [
                {
                    entitet: 'Arbeidsforhold',
                    varslingskode: {
                        kode: 'AFIDHI',
                        beskrivelse: 'Arbeidsforholdet har id-historikk',
                    },
                },
            ],
            rapporteringsordning: {
                kode: 'a-ordningen',
                beskrivelse: 'Rapportert via a-ordningen (2015-d.d.)',
            },
            navArbeidsforholdId: 45678,
            sistBekreftet: '2020-07-28T09:10:19',
        },
    ],
    totalAntall: 5,
};
