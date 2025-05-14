import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import useSprak from '../../hooks/useSprak';
import { ReactNode } from 'react';
import Head from 'next/head';
import { SkjemaBox } from './skjema-box';
import { Alert, Heading } from '@navikt/ds-react';

const Hindringer = (props: { children: ReactNode }) => {
    const TEKSTER: Tekster<string> = {
        nb: {
            sideTittel: 'Arbeidssøkerregistrering: Hindringer',
            fortellMer:
                'Svarer du ja på noen av spørsmålene, kan du fortelle mer til en veileder i en oppfølgingssamtale. Vi kontakter deg når du har registrert deg.',
        },
        nn: {
            sideTittel: 'Arbeidssøkjarregistrering: Hindringar',
            fortellMer:
                'Svarer du ja på nokre av spørsmåla, kan du utdjupe dette nærmare til ein rettleiar i ein oppfølgingssamtale. Vi kontaktar deg når du har registrert deg.',
        },
        en: {
            sideTittel: 'Register as a Job Seeker : Impediments',
            fortellMer:
                'If you answer yes on any of the questions, you can tell your NAV counsellor more in a follow-up interview. We will contact you once you have registered.',
        },
    };

    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const { children } = props;

    return (
        <>
            <Head>
                <title>{tekst('sideTittel')}</title>
            </Head>
            <SkjemaBox>
                <form>{children}</form>
            </SkjemaBox>
            <Alert variant="info" inline={true} className={'mt-6'}>
                {tekst('fortellMer')}
            </Alert>
        </>
    );
};

export default Hindringer;
