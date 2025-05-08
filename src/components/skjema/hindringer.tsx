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
            heading: 'Hindringer',
            fortellMer:
                'Svarer du ja, kan du fortelle mer til en veileder i en oppfølgingssamtale. Vi kontakter deg når du har registrert deg.',
        },
        nn: {
            sideTittel: 'Arbeidssøkjarregistrering: Hindringar',
            heading: 'Hindringar',
            fortellMer:
                'Svarer du ja, kan du utdjupe dette nærmare til ein rettleiar i ein oppfølgingssamtale. Vi kontaktar deg når du har registrert deg.',
        },
        en: {
            sideTittel: 'Register as a Job Seeker : Impediments',
            heading: 'Impediments',
            fortellMer:
                'If you answer yes, you can tell your NAV counsellor more in a follow-up interview. We will contact you once you have registered.',
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
                <form>
                    <Heading size="medium" spacing level="1">
                        {tekst('heading')}
                    </Heading>
                    {children}
                </form>
            </SkjemaBox>
            <Alert variant="info" inline={true} className={'mt-6'}>
                {tekst('fortellMer')}
            </Alert>
        </>
    );
};

export default Hindringer;
