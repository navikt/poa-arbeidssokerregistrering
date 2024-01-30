import { GuidePanel, Heading, Link } from '@navikt/ds-react';
import styles from '../../styles/guidepanel.module.css';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import useSprak from '../../hooks/useSprak';
import RettigheterSvg from './rettigheter-svg';

const TEKSTER: Tekster<string> = {
    nb: {
        tittel: 'Rettigheter',
        kravPaVurdering:
            'Du har krav på at NAV vurderer behovet ditt for veiledning. Dette er en rettighet du har etter ',
        paragraf14a: 'NAV-loven § 14a. (les paragrafen på lovdata.no)',
        brev: 'Du får et brev der du kan lese mer om tjenestene vi foreslår for deg.',
    },
};

const RettigheterPanel = () => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    return (
        <GuidePanel className={styles.rettigheter} poster illustration={<RettigheterSvg />}>
            <Heading size={'small'} level={'2'}>
                {tekst('tittel')}
            </Heading>
            <ul className="list-disc px-8 mt-4">
                <li>
                    {tekst('kravPaVurdering')}
                    <Link target="_blank" href="https://lovdata.no/dokument/NL/lov/2006-06-16-20/KAPITTEL_3#%C2%A714a">
                        {tekst('paragraf14a')}
                    </Link>
                </li>
                <li>{tekst('brev')}</li>
            </ul>
        </GuidePanel>
    );
};

export default RettigheterPanel;
