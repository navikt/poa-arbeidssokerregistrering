import { BodyLong, Button, Heading, Panel, ReadMore } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import Head from 'next/head';

import useSprak from '../../../hooks/useSprak';

import { lagHentTekstForSprak, Tekster, SisteJobb } from '@navikt/arbeidssokerregisteret-utils';
import StillingsSok from './stillings-sok';
import { SkjemaKomponentProps } from '../skjema-felleskomponenter';
import { fetcher } from '../../../lib/api-utils';
import styles from '../../../styles/skjema.module.css';

const TEKSTER: Tekster<string> = {
    nb: {
        tittel: 'Hva er din siste jobb?',
        registrert: 'Følgende informasjon er registrert i Aa-registeret om din siste stilling.',
        feilOpplysninger: 'Hvis opplysningen er feil, kan du endre under.',
        brukesTilTittel: 'Hva bruker vi informasjonen om din siste stilling til?',
        brukesTilInnhold:
            'Vi bruker opplysningene til å lage offentlig statistikk om arbeidsmarkedet. Hvis opplysningene er feil, kan du endre dem. Da får NAV riktigere statistikk. Vær oppmerksom på at opplysningene er hentet fra Arbeidsgiver- og arbeidstakerregisteret (Aa-registeret). Endrer du opplysninger hos NAV, blir de bare lagret hos oss. I Aa-registeret er det kun arbeidsgivere som kan endre.',
        stilling: 'Stilling',
    },
};

const annenStilling: SisteJobb = {
    label: 'Annen stilling',
    konseptId: -1,
    styrk08: '-1',
};

const SisteJobb = (props: SkjemaKomponentProps<SisteJobb> & { children?: JSX.Element; visSisteJobb: boolean }) => {
    const { onChange, visSisteJobb } = props;
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const [visStillingsSok, settVisStillingsSok] = useState<boolean>(false);
    const onCloseStillingssok = (value?: any) => {
        if (value) {
            onChange(value);
        }
        settVisStillingsSok(false);
    };

    const sisteArbeidsforholdUrl = 'api/sistearbeidsforhold-fra-aareg/';
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
                <title>Arbeidssøkerregistrering: Hva er din siste jobb?</title>
            </Head>
            <Panel className={`${styles.panel} mb-6`} border={true}>
                <div>
                    <Heading spacing size={'medium'} level="1">
                        {tekst('tittel')}
                    </Heading>
                    <BodyLong>{tekst('registrert')}</BodyLong>
                    <BodyLong className="mb-6">{tekst('feilOpplysninger')}</BodyLong>

                    {props.children}

                    {visSisteJobb && (
                        <div className="mb-4">
                            <Heading spacing size={'small'} level="2">
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
                                        Endre
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    <ReadMore header={tekst('brukesTilTittel')}>
                        <div style={{ maxWidth: '34rem' }}>{tekst('brukesTilInnhold')}</div>
                    </ReadMore>
                </div>
            </Panel>
        </>
    );
};

export default SisteJobb;
