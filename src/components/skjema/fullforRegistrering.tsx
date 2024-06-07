import { useState } from 'react';
import { Alert, ConfirmationPanel, GuidePanel, Heading, ReadMore } from '@navikt/ds-react';
import Head from 'next/head';

import useSprak from '../../hooks/useSprak';

import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import { Side, SkjemaState } from '../../model/skjema';
import guidePanelStyles from '../../styles/guidepanel.module.css';
import PlikterSvg from '../forsiden/plikter-svg';
import FullforRegistreringKnappNyInngang from './fullfor-registrering-knapp-ny-inngang';

const TEKSTER: Tekster<string> = {
    nb: {
        tittel: 'Fullfør registreringen',
        naarDuFullforer: 'Når du fullfører, godtar du kravene under fra NAV. Du må',
        sendeMeldekort: 'sende meldekort hver 14. dag',
        registrereCV: 'registrere CV-en din og holde den oppdatert',
        aktivJobbsoker: 'være en aktiv jobbsøker',
        brukeAktivitetsplan: 'bruke aktivitetsplanen din',
        lesMer: 'Les mer om kravene',
        okonomi: 'Økonomi',
        okonomiInfo:
            'Hvis du skal søke om dagpenger eller annen støtte fra NAV, må du gjøre det i en egen søknad ' +
            'etter at du har fullført registreringen. For å motta støtte, må du oppfylle kravene NAV stiller.',
        meldekort: 'Meldekort',
        meldekortInfo:
            'For å få oppfølging og støtte må du hver 14. dag melde fra at du fortsatt ønsker å være registrert som arbeidssøker. ' +
            'Dette gjør du ved å sende meldekort. Sender du meldekort for sent, kan det føre til at utbetalingen din blir redusert eller stanset.',
        aktivitetsplan: 'Aktivitetsplanen',
        aktivitetsplanInfo:
            'I aktivitetsplanen kan du holde orden på aktiviteter du gjør i samarbeid med NAV. ' +
            'Du kan også kommunisere med veilederen din. Når du fullfører registreringen, vil det ligge oppgaver til deg i aktivitetsplanen.',
        CV: 'CV',
        CVInfo:
            'Når du fullfører registreringen, vil du få en oppgave i aktivitetsplanen om at du må fylle ut CV-en din. ' +
            'Det er viktig at du holder CV-en din oppdatert slik at NAV kan bistå deg med å komme i arbeid. ',
        lestOgForstaatt: 'Jeg har lest og forstått kravene',
        lestKravFeilmelding: 'Du må huke av at du har lest og forstått kravene for å kunne fullføre registreringen.',
        fullfoerRegistrering: 'Fullfør',
    },
};

interface FullforProps {
    skjemaState: SkjemaState;
    side: Side;
    onSubmit(): void;
}

const FullforRegistrering = (props: FullforProps) => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const [lestKravChecked, setLestKravChecked] = useState<boolean>(false);
    const [visFeilmeldingLestKrav, settVisFeilmeldingLestKrav] = useState<boolean>(false);
    const { skjemaState, onSubmit, side } = props;

    const onValiderSkjema = () => {
        if (!lestKravChecked) {
            settVisFeilmeldingLestKrav(true);
            return false;
        }

        return true;
    };

    return (
        <>
            <Head>
                <title>Arbeidssøkerregistrering: Fullfør registreringen</title>
            </Head>
            <div style={{ width: '100%' }}>
                <Heading size={'large'} level={'1'} className="text-center mb-6">
                    {tekst('tittel')}
                </Heading>
                <GuidePanel className={`${guidePanelStyles.plikter} mb-6`} poster illustration={<PlikterSvg />}>
                    <Heading level={'2'} size={'xsmall'}>
                        {tekst('naarDuFullforer')}
                    </Heading>
                    <ul className="list-disc px-8 my-4">
                        <li> {tekst('sendeMeldekort')} </li>
                        <li>{tekst('registrereCV')}</li>
                        <li>{tekst('aktivJobbsoker')}</li>
                        <li>{tekst('brukeAktivitetsplan')}</li>
                    </ul>
                </GuidePanel>
                <ReadMore header={tekst('lesMer')}>
                    <ul className="list-disc px-8">
                        <li className="mb-4">
                            <Heading level={'3'} size={'xsmall'}>
                                {tekst('okonomi')}
                            </Heading>
                            {tekst('okonomiInfo')}
                        </li>
                        <li className="mb-4">
                            <Heading level={'3'} size={'xsmall'}>
                                {tekst('meldekort')}
                            </Heading>
                            {tekst('meldekortInfo')}
                        </li>
                        <li className="mb-4">
                            <Heading level={'3'} size={'xsmall'}>
                                {tekst('aktivitetsplan')}
                            </Heading>
                            {tekst('aktivitetsplanInfo')}
                        </li>
                        <li>
                            <Heading level={'3'} size={'xsmall'}>
                                {tekst('CV')}
                            </Heading>
                            {tekst('CVInfo')}
                        </li>
                    </ul>
                </ReadMore>
                <ConfirmationPanel
                    checked={lestKravChecked}
                    onChange={() => {
                        settVisFeilmeldingLestKrav(false);
                        setLestKravChecked(!lestKravChecked);
                    }}
                    label={tekst('lestOgForstaatt')}
                    className="my-8"
                />

                {visFeilmeldingLestKrav && (
                    <div className="mb-6">
                        <Alert variant={'warning'}>{tekst('lestKravFeilmelding')}</Alert>
                    </div>
                )}

                <FullforRegistreringKnappNyInngang
                    skjemaState={skjemaState}
                    onSubmit={onSubmit}
                    onValiderSkjema={onValiderSkjema}
                    tekst={tekst}
                />
            </div>
        </>
    );
};

export default FullforRegistrering;
