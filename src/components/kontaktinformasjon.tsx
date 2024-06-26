import { Alert, Box, Detail, Heading, HelpText, Label, Link, Panel } from '@navikt/ds-react';
import useSprak from '../hooks/useSprak';
import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { Kontaktinformasjon as KontaktInfo } from '../model/kontaktinformasjon';
import useSWR from 'swr';
import { fetcher } from '../lib/api-utils';
import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';

const TEKSTER: Tekster<string> = {
    nb: {
        tlfHosKRR: 'Telefonnummer lagret hos Kontakt- og reservasjonsregisteret',
        kildeKRR: 'Kilde: Kontakt- og reservasjonsregisteret',
        tlfHosNAV: 'Telefonnummer lagret hos NAV',
        kildeNAV: 'Kilde: NAV',
        endreOpplysninger: 'Endre opplysninger',
        ingenOpplysninger: 'Ingen kontaktopplysninger funnet!',
        leggInnOpplysninger: 'Legg inn kontaktopplysninger',
        hjelpetekst: 'Pass på at kontaktopplysningene dine er oppdatert, ellers kan vi ikke nå deg.',
    },
    nn: {
        tlfHosKRR: 'Telefonnummer lagra hos Kontakt- og reservasjonsregisteret',
        kildeKRR: 'Kjelde: Kontakt- og reservasjonsregisteret',
        tlfHosNAV: 'Telefonnummer lagra hos NAV',
        kildeNAV: 'Kjelde: NAV',
        endreOpplysninger: 'Endre opplysningar',
        ingenOpplysninger: 'Ingen kontaktopplysningar funnet!',
        leggInnOpplysninger: 'Legg inn kontaktopplysningar',
        hjelpetekst: 'Pass på at kontaktopplysningane dine er oppdaterte, slik at vi kan nå tak i deg.',
    },
    en: {
        tlfHosKRR: "Telephone number stored in NAV's Contact and Reservation Register",
        kildeKRR: 'Source: Contact and Reservation Registe',
        tlfHosNAV: "Telephone number in NAV's archives",
        kildeNAV: 'Source: NAV',
        endreOpplysninger: 'Change information',
        ingenOpplysninger: 'We could not find any contact information!',
        leggInnOpplysninger: 'Enter contact details',
        hjelpetekst: 'Make sure your contact information is up to date or we will not be able to reach you.',
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
                {tlfKrr && <Telefonnummer kilde="KRR" telefonnummer={tlfKrr} />}
                {tlfNav && <Telefonnummer kilde="NAV" telefonnummer={tlfNav} />}
                <EndreOpplysningerLink tekst={tekst('endreOpplysninger')} />
            </>
        );
    } else
        return (
            <>
                <Alert variant="error" inline className="mb-6">
                    <div style={{ display: 'flex' }}>
                        {tekst('ingenOpplysninger')}
                        <HelpText>{tekst('hjelpetekst')}</HelpText>
                    </div>
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
        <Box className="mb-6">
            <Heading level="2" size={'small'}>
                {tekst(`tlfHos${props.kilde}`)}
            </Heading>
            <Label>{props.telefonnummer}</Label>
            <Detail>{tekst(`kilde${props.kilde}`)}</Detail>
        </Box>
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
