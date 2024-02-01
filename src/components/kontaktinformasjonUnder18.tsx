import { Alert, BodyShort, Heading, Link } from '@navikt/ds-react';
import { ExternalLinkIcon, PhoneIcon } from '@navikt/aksel-icons';
import useSWR from 'swr';

import useSprak from '../hooks/useSprak';

import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import { Kontaktinformasjon as KontaktInfo } from '../model/kontaktinformasjon';
import { fetcher } from '../lib/api-utils';

const TEKSTER: Tekster<string> = {
    nb: {
        tlfHosKRR: 'Telefonnummer lagret hos Kontakt- og reservasjonsregisteret',
        tlfHosNAV: 'Telefonnummer lagret hos NAV',
        endreOpplysninger: 'Endre kontaktopplysninger på nav.no',
        ingenOpplysninger: 'Ingen kontaktopplysninger funnet!',
        leggInnOpplysninger: 'Legg inn kontaktopplysninger på nav.no',
        hjelpetekst: 'Pass på at kontaktopplysningene dine er oppdatert, ellers kan vi ikke nå deg.',
    },
};

export const Kontaktinformasjon = () => {
    const { data } = useSWR<KontaktInfo>('api/kontaktinformasjon/', fetcher);
    const tlfKrr = data?.telefonnummerHosKrr;
    const tlfNav = data?.telefonnummerHosNav;
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);

    if (tlfKrr || tlfNav) {
        return (
            <>
                {tlfNav && <Telefonnummer kilde="NAV" telefonnummer={tlfNav} />}
                {tlfKrr && <Telefonnummer kilde="KRR" telefonnummer={tlfKrr} />}
                <EndreOpplysningerLink tekst={tekst('endreOpplysninger')} />
            </>
        );
    } else
        return (
            <>
                <Alert variant="error" inline className="mb-6">
                    {tekst('ingenOpplysninger')}
                </Alert>
                <EndreOpplysningerLink tekst={tekst('leggInnOpplysninger')} />
            </>
        );
};

type Kilde = 'KRR' | 'NAV';

const Telefonnummer = (props: { kilde: Kilde; telefonnummer: string }) => {
    const sprak = useSprak();
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);

    return (
        <div className="mb-6">
            <Heading level="2" size="xsmall">
                {tekst(`tlfHos${props.kilde}`)}
            </Heading>
            <BodyShort size="large" className="flex">
                <PhoneIcon />
                <span className="ml-1">{props.telefonnummer}</span>
            </BodyShort>
        </div>
    );
};

const EndreOpplysningerLink = (props: { tekst: string }) => {
    return (
        <Link href="https://www.nav.no/person/personopplysninger/#kontaktinformasjon" target="_blank">
            {props.tekst}
            <ExternalLinkIcon />
        </Link>
    );
};
