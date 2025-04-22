import { BodyLong, Button, Heading, ReadMore } from '@navikt/ds-react';
import { JSX, useEffect, useState } from 'react';
import useSWR from 'swr';
import Head from 'next/head';
import { lagHentTekstForSprak, Tekster, SisteJobb } from '@navikt/arbeidssokerregisteret-utils';

import useSprak from '../../../hooks/useSprak';
import { useFeatureToggles } from '../../../contexts/featuretoggle-context';

import StillingsSok from './stillings-sok-v2';
import { SkjemaKomponentProps } from '../skjema-felleskomponenter';
import { fetcher } from '../../../lib/api-utils';
import { SkjemaBox } from '../skjema-box';

const TEKSTER: Tekster<string> = {
    nb: {
        sideTittel: 'Arbeidssøkerregistrering: Hva er din siste jobb?',
        tittel: 'Hva er din siste jobb?',
        registrert: 'Følgende informasjon er registrert i Aa-registeret om din siste stilling.',
        feilOpplysninger: 'Hvis opplysningen er feil, kan du endre under.',
        brukesTilTittel: 'Hva bruker vi informasjonen om din siste stilling til?',
        brukesTilInnhold:
            'Vi bruker opplysningene til å lage offentlig statistikk om arbeidsmarkedet. Hvis opplysningene er feil, kan du endre dem. Da får NAV riktigere statistikk. Vær oppmerksom på at opplysningene er hentet fra Arbeidsgiver- og arbeidstakerregisteret (Aa-registeret). Endrer du opplysninger hos NAV, blir de bare lagret hos oss. I Aa-registeret er det kun arbeidsgivere som kan endre.',
        stilling: 'Stilling',
        endreKnapp: 'Endre',
    },
    nn: {
        sideTittel: 'Arbeidssøkjarregistrering: Kva var den siste jobben din?',
        tittel: 'Kva var den siste jobben din?',
        registrert: 'Følgjande informasjon er registrert i Aa-registeret om den siste stillinga di.',
        feilOpplysninger: 'Dersom informasjonen er feil, kan du gjere endringar under.',
        brukesTilTittel: 'Kva bruker vi informasjonen om den siste stillinga di til?',
        brukesTilInnhold:
            'Vi bruker opplysningane til å lage offentleg statistikk om arbeidsmarknaden. Dersom opplysningane er feil, kan du endre dei. Dette bidrar til at NAV får rettare statistikk. Ver merksam på at opplysningane er henta frå Arbeidsgivar- og arbeidstakarregisteret (Aa-registeret). Dersom du endrar opplysningar hos NAV, blir dei berre lagra hos oss. Det er berre arbeidsgivarar som kan gjere endringar i Aa-registeret.',
        stilling: 'Stilling',
        endreKnapp: 'Endre',
    },
    en: {
        sideTittel: 'Register as a Job Seeker : What was your last job?',
        tittel: 'What was your last job?',
        registrert:
            'We found the following information in the State Register of Employers and Employees (Aa Register) about your last position.',
        feilOpplysninger: 'If the information is incorrect, you can change it below.',
        brukesTilTittel: 'What do we use the information about your last position for?',
        brukesTilInnhold:
            "We use the information to compile public statistics on the labour market. If the information is incorrect, you can change it. This will give NAV more accurate statistics. Please note that the information is retrieved from the State Register of Employers and Employees (Aa Register). If you change NAV's information, it will only be stored with us. Only employers can change the information in the Aa Register.",
        stilling: 'Position',
        endreKnapp: 'Change',
    },
};

const annenStilling: SisteJobb = {
    label: 'Annen stilling',
    konseptId: -1,
    styrk08: '-1',
};

const SisteJobbSkjema = (
    props: SkjemaKomponentProps<SisteJobb> & { children?: JSX.Element; visSisteJobb: boolean },
) => {
    const { toggles } = useFeatureToggles();
    const { onChange, visSisteJobb } = props;
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const [visStillingsSok, settVisStillingsSok] = useState<boolean>(false);
    const onCloseStillingssok = (value?: any) => {
        if (value) {
            onChange(value);
        }
        settVisStillingsSok(false);
    };

    const sisteArbeidsforholdUrl = 'api/sistearbeidsforhold-fra-aareg-v2/';

    const { data: sisteArbeidsforhold, error, isLoading } = useSWR(sisteArbeidsforholdUrl, fetcher);

    useEffect(() => {
        if (sisteArbeidsforhold && !props.valgt) {
            onChange(sisteArbeidsforhold);
        }
        if (!sisteArbeidsforhold && !props.valgt && !isLoading) {
            // 204 fra server
            onChange(annenStilling);
        }
    }, [onChange, props.valgt, sisteArbeidsforhold, isLoading]);

    useEffect(() => {
        if (error && !props.valgt) {
            onChange(annenStilling);
        }
    }, [error, onChange, props.valgt]);

    return (
        <>
            <Head>
                <title>{tekst('sideTittel')}</title>
            </Head>
            <SkjemaBox>
                <div>
                    <Heading spacing size={'medium'} level="1">
                        {tekst('tittel')}
                    </Heading>
                    <BodyLong>{tekst('registrert')}</BodyLong>
                    <BodyLong className="mb-6">{tekst('feilOpplysninger')}</BodyLong>

                    {props.children}

                    {visSisteJobb && (
                        <div className="mb-4">
                            <Heading spacing size={'small'} level="2" className={'mt-6'}>
                                {tekst('stilling')}
                            </Heading>
                            {visStillingsSok ? (
                                <StillingsSok onClose={onCloseStillingssok} />
                            ) : (
                                <div>
                                    {props.valgt?.label}
                                    <Button
                                        variant="tertiary"
                                        className="ml-4"
                                        onClick={() => settVisStillingsSok(true)}
                                    >
                                        {tekst('endreKnapp')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    <ReadMore header={tekst('brukesTilTittel')}>
                        <div style={{ maxWidth: '34rem' }}>{tekst('brukesTilInnhold')}</div>
                    </ReadMore>
                </div>
            </SkjemaBox>
        </>
    );
};

export default SisteJobbSkjema;
