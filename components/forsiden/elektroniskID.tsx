import lagHentTekstForSprak, { Tekster } from '../../lib/lag-hent-tekst-for-sprak';
import { BodyShort, Heading, Link } from '@navikt/ds-react';
import useSprak from '../../hooks/useSprak';
import { Next } from '@navikt/ds-icons';
import Image from 'next/image';
import bankIdSvg from './bankid.svg';
import navKontorSvg from './nav-kontor.svg';
import styles from './elektroniskID.module.css';

const TEKSTER: Tekster<string> = {
    nb: {
        tittel: 'Har du ikke elektronisk ID?',
        skaffDegTittel: 'Skaff deg elektronisk ID',
        skaffDegBody:
            'Hos ID-porten kan du skaffe deg elektronisk ID. Du kan velge mellom BankId, BankID på mobil, Buypass eller Commfides.',
        minIdPassportTittel: 'MinID Passport',
        minIdPassportBody: 'MinID Passport er en elektronisk ID som kan brukes for å logge på nav.no. ',
        minIdPassportLenke: ' bruker pass som bekreftelse.',
        navKontoretTittel: 'Registrer deg på NAV-kontoret',
        navKontoretBody1:
            'Hvis du ikke kan skaffe deg elektronisk ID, må du møte opp på NAV-kontoret ditt. Der kan du få hjelp til å registere deg slik at du kan sende meldekort med MinID.',
        navKontoretBody2:
            'Du kan finne ditt NAV kontor ved å søke på postnummer, poststed eller kommunenavn i søkefeltet.',
        navKontoretSok: 'Søk etter NAV kontor',
    },
    en: {
        tittel: 'Do you not have an electronic ID?',
        skaffDegTittel: 'Get your electronic ID',
        skaffDegBody:
            'You can get an electronic ID at ID-porten. You can choose between BankId, BankID on mobile, Buypass or Commfides.',
        minIdPassportTittel: 'MinID Passport',
        minIdPassportBody: 'MinID Passport is an electronic ID solution which can be used to log into nav.no. ',
        minIdPassportLenke: ' uses passport verification.',
        navKontoretTittel: 'Register at the NAV office',
        navKontoretBody1:
            'If you cannot obtain an electronic ID, you must show up at your NAV office. There you can get help to register so that you can send report cards with MinID.',
        navKontoretBody2:
            'You can find your NAV office by searching by postcode, postal address or municipality name in the search field.',
        navKontoretSok: 'Search for NAV office',
    },
};

const ElektroniskID = () => {
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    return (
        <div className={styles.elektroniskID}>
            <Heading level="2" size={'large'} className={'text-center'} spacing={true}>
                {tekst('tittel')}
            </Heading>
            <div className={`${styles.wrapper} flex-center flex-wrap`} style={{ alignItems: 'flex-start' }}>
                <div className={styles.info}>
                    <div className="text-center mbs">
                        <Image src={bankIdSvg} alt="BankID illustrasjon" />
                    </div>
                    <Heading size={'small'} level="3" spacing={true}>
                        {tekst('skaffDegTittel')}
                    </Heading>
                    <BodyShort spacing={true}>{tekst('skaffDegBody')}</BodyShort>
                    <Link className="mbm" href="https://eid.difi.no/nb/bankid">
                        {tekst('skaffDegTittel')} <Next />{' '}
                    </Link>
                    <Heading size={'small'} level="3" spacing={true}>
                        {tekst('minIdPassportTittel')}
                    </Heading>
                    <BodyShort spacing={true}>
                        {tekst('minIdPassportBody')}
                        {tekst('minIdPassportTittel')}
                        <Link href="https://eid.difi.no/nb/minid/passport">{tekst('minIdPassportLenke')}</Link>
                    </BodyShort>
                </div>
                <div className={styles.info}>
                    <div className="text-center mbs">
                        <Image src={navKontorSvg} alt="NAV-kontor illustrasjon" />
                    </div>
                    <Heading size={'small'} level="3" spacing={true}>
                        {tekst('navKontoretTittel')}
                    </Heading>
                    <BodyShort spacing={true}>{tekst('navKontoretBody1')}</BodyShort>
                    <BodyShort spacing={true}>{tekst('navKontoretBody2')}</BodyShort>
                    <Link href="https://eid.difi.no/nb/bankid">
                        {tekst('navKontoretSok')} <Next />{' '}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ElektroniskID;
