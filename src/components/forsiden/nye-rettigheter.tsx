import { GuidePanel, Heading, Link } from '@navikt/ds-react';
import styles from '../../styles/guidepanel.module.css';
import lagHentTekstForSprak, { Tekster } from '../../lib/lag-hent-tekst-for-sprak';
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

const NyeRettigheterPanel = () => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());

    return (
        <GuidePanel poster>
            <Heading size={'large'} level={'2'} className="text-center">
                {tekst('tittel')}
            </Heading>
            <ul className="list-disc px-8 mt-4">
                <li>
                    Du har rett til å registrere deg som arbeidssøker hos NAV hvis du oppfyller forutsetningene gitt i{' '}
                    <Link target="_blank" href="https://lovdata.no/dokument/NL/lov/2006-06-16-20/KAPITTEL_3#%C2%A714a">
                        arbeidsmarkedslovens §10
                    </Link>
                </li>

                <li>
                    Du har krav på at NAV vurderer behovet ditt for veiledning med mål om å komme tilbake i arbeid. Du
                    kan lese mer om dette i{' '}
                    <Link target="_blank" href="https://lovdata.no/dokument/NL/lov/2006-06-16-20/KAPITTEL_3#%C2%A714a">
                        NAV-loven §14a
                    </Link>{' '}
                    på lovdata.no
                </li>
                <li>Du kan søke om dagpenger eller andre ytelser når du har registrert deg som arbeidssøker</li>
            </ul>
        </GuidePanel>
    );
};

export default NyeRettigheterPanel;
