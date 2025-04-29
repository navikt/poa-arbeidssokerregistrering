import { withAuthenticatedPage } from '../auth/withAuthentication';
import { BodyLong, BodyShort, Heading, HGrid } from '@navikt/ds-react';
import kvitteringIkonSvg from '../components/kvittering-ikon.svg';
import Image from 'next/image';
import { lagHentTekstForSprak } from '@navikt/arbeidssokerregisteret-utils';
import LenkePanel from '../components/lenke-panel';

const TEKSTER = {
    nb: {
        heading: 'Du er registrert som arbeidssøker',
        body1: 'Du må bekrefte at du ønsker å være registrert hver 14. dag.',
        body2: 'Nav vil vurdere de opplysningene du har gitt oss mot opplysningene vi har om andre arbeidssøkere i omtrent samme situasjon. Basert på dette vil en veileder fatte et oppfølgingsvedtak som sendes til deg. Vedtaket forteller hvordan Nav vurderer din situasjon i arbeidsmarkedet og hvilken hjelp du kan få fra Nav.',
        innholdHeading: 'Innhold for deg som er arbeidssøker',
        bekreftelseLenkeHref: '/bekreftelse',
        bekreftelseLenkeTittel: 'Bekreft at du vil være registrert som arbeidssøker',
        bekreftelseLenkeBeskrivelse: 'Slik bekrefter du arbeidssøkerperioden din',
        minSideLenkeHref: '/minside',
        minSideLenkeTittel: 'Min side',
        minSideLenkeBeskrivelse: 'Se dine tjenester som arbeidssøker',
        dagpengerLenkeHref: '/dagpenger',
        dagpengerLenkeTittel: 'Dagpenger',
        dagpengerLenkeBeskrivelse: 'Dette kan du ha rett til',
    },
};

const NyKvittering = () => {
    const tekst = lagHentTekstForSprak(TEKSTER, 'nb');
    return (
        <div className="max-w-4xl">
            <HGrid columns={{ sm: 1, md: 1, lg: '1fr auto', xl: '1fr auto' }} gap={{ lg: 'space-24' }}>
                <div style={{ width: '96px', height: '96px' }}>
                    <Image src={kvitteringIkonSvg} alt="ikon" width={96} height={96} />
                </div>
                <div>
                    <Heading size={'xlarge'} level={'1'} spacing>
                        {tekst('heading')}
                    </Heading>
                    <BodyShort spacing>{tekst('body1')}</BodyShort>
                    <BodyLong spacing>{tekst('body2')}</BodyLong>
                    <Heading spacing size={'small'} level={'3'}>
                        {tekst('innholdHeading')}
                    </Heading>
                    <ul className={'list-none'}>
                        <li className={'mb-4'}>
                            <LenkePanel
                                href={tekst('bekreftelseLenkeHref')}
                                title={tekst('bekreftelseLenkeTittel')}
                                description={tekst('bekreftelseLenkeBeskrivelse')}
                            />
                        </li>
                        <li className={'mb-4'}>
                            <LenkePanel
                                href={tekst('minSideLenkeHref')}
                                title={tekst('minSideLenkeTittel')}
                                description={tekst('minSideLenkeBeskrivelse')}
                            />
                        </li>
                        <li className={'mb-4'}>
                            <LenkePanel
                                href={tekst('dagpengerLenkeHref')}
                                title={tekst('dagpengerLenkeTittel')}
                                description={tekst('dagpengerLenkeBeskrivelse')}
                            />
                        </li>
                    </ul>
                </div>
            </HGrid>
        </div>
    );
};
export const getServerSideProps = withAuthenticatedPage();
export default NyKvittering;
