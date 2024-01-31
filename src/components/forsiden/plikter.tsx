import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import useSprak from '../../hooks/useSprak';
import { GuidePanel, Heading } from '@navikt/ds-react';
import styles from '../../styles/guidepanel.module.css';
import PlikterSvg from './plikter-svg';

const TEKSTER: Tekster<string> = {
    nb: {
        tittel: 'Plikter',
        sendeMeldekort: 'Du må sende meldekort hver 14. dag. Det er et krav for å få oppfølging og økonomisk støtte.',
        aktivArbeidssoker: 'Du må være aktiv arbeidssøker, søke på ledige stillinger og holde CV-en oppdatert.',
    },
};

const PlikterPanel = () => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    return (
        <GuidePanel className={styles.plikter} poster illustration={<PlikterSvg />}>
            <Heading size={'small'} level={'2'}>
                {tekst('tittel')}
            </Heading>
            <ul className="list-disc px-8 mt-4">
                <li>{tekst('sendeMeldekort')}</li>
                <li>{tekst('aktivArbeidssoker')}</li>
            </ul>
        </GuidePanel>
    );
};

export default PlikterPanel;
