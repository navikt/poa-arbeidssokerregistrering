import { BodyLong, Heading, Link } from '@navikt/ds-react';
import { ChevronRightIcon } from '@navikt/aksel-icons';
import Image from 'next/image';

import useSprak from '../../hooks/useSprak';

import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import bankIdSvg from './bankid.svg';
import navKontorSvg from './nav-kontor.svg';
import styles from './elektroniskID.module.css';

const TEKSTER: Tekster<string> = {
    nb: {
        tittel: 'Har du ikke elektronisk ID?',
        skaffDegTittel: 'Skaff deg elektronisk ID',
        skaffDegBody:
            'Hos ID-porten kan du skaffe deg elektronisk ID. Du kan velge mellom BankId, Buypass eller Commfides.',
        navKontoretTittel: 'Registrer deg på NAV-kontoret',
        navKontoretBody1:
            'Hvis du ikke kan skaffe deg elektronisk ID, må du møte opp på NAV-kontoret ditt. Der kan du få hjelp til å registere deg slik at du kan sende meldekort med MinID.',
        navKontoretBody2:
            'Du kan finne ditt NAV kontor ved å søke på postnummer, poststed eller kommunenavn i søkefeltet.',
        navKontoretSok: 'Søk etter NAV kontor',
    },
    nn: {
        tittel: 'Har du ikkje elektronisk ID?',
        skaffDegTittel: 'Skaff deg elektronisk ID',
        skaffDegBody:
            'På ID-porten kan du skaffe deg elektronisk ID. Du kan velje mellom BankID, Buypass eller Commfides.',
        navKontoretTittel: 'Registrer deg på NAV-kontoret',
        navKontoretBody1:
            'Dersom du ikkje er i stand til å skaffe elektronisk ID, møter du opp på NAV-kontoret ditt. Der kan du få hjelp til å registrere deg, slik at du kan sende meldekort med MinID.',
        navKontoretBody2:
            'For å finne ditt lokale NAV-kontor legg du inn postnummer, poststad eller kommunenamn i søkjefeltet.',
        navKontoretSok: 'Søk etter NAV-kontor',
    },
    en: {
        tittel: "Don't have an electronic ID?",
        skaffDegTittel: 'How to get an electronic ID',
        skaffDegBody: 'Use ID-porten to obtain an electronic ID. You can choose between BankID, Buypass or Commfides.',
        navKontoretTittel: 'Register with a NAV office',
        navKontoretBody1:
            'If you cannot obtain an electronic ID, you must go to your NAV office in person. You will get help there to register so you can begin reporting to NAV using the Employment Status Form via MinID.',
        navKontoretBody2:
            'You can find your NAV office by searching the postal code or the name of your city or municipality in the search field.',
        navKontoretSok: 'Search for your NAV office',
    },
};

const ElektroniskID = () => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    return (
        <div className={styles.elektroniskID}>
            <Heading level="2" size={'large'} className={'text-center'} spacing={true}>
                {tekst('tittel')}
            </Heading>
            <div className={`${styles.wrapper} flex items-start justify-center flex-wrap`}>
                <div className={styles.info}>
                    <div className="text-center mb-4">
                        <Image src={bankIdSvg} alt="" />
                    </div>
                    <Heading size={'small'} level="3" spacing={true}>
                        {tekst('skaffDegTittel')}
                    </Heading>
                    <BodyLong spacing={true}>{tekst('skaffDegBody')}</BodyLong>
                    <Link className="mb-6" href="https://eid.difi.no/bankid">
                        {tekst('skaffDegTittel')} <ChevronRightIcon aria-hidden="true" />
                    </Link>
                </div>
                <div className={styles.info}>
                    <div className="text-center mb-4">
                        <Image src={navKontorSvg} alt="" />
                    </div>
                    <Heading size={'small'} level="3" spacing={true}>
                        {tekst('navKontoretTittel')}
                    </Heading>
                    <BodyLong spacing={true}>{tekst('navKontoretBody1')}</BodyLong>
                    <BodyLong spacing={true}>{tekst('navKontoretBody2')}</BodyLong>
                    <Link href="https://www.nav.no/sok-nav-kontor">
                        {tekst('navKontoretSok')} <ChevronRightIcon aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ElektroniskID;
