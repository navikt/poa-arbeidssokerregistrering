import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import { Alert, BodyLong, Heading, Link } from '@navikt/ds-react';
import { NextPageProps } from '@/types/next';
import LoggVisning from '@/app/veiledning/oppholdstillatelse/logg-visning';
import SettSprakIDekorator from '@/components/sett-sprak-i-dekorator';

const TEKSTER: Tekster<string> = {
    nb: {
        overskriftNy: 'Du må registreres som arbeidssøker av en veileder',
        innholdNy: 'Noen av opplysningene vi har hentet om deg må kontrolleres manuelt.',
        kontaktOssTekstNy: 'for å bli registrert som arbeidssøker',
        kontaktOssLenke: 'https://www.nav.no/kontaktoss#chat-med-oss',
        kontaktOssLenkeTekst: 'Ta kontakt med Nav',
    },
    nn: {
        overskriftNy: 'Ein rettleiar må registrere deg som arbeidssøkjar',
        innholdNy: 'Enkelte av opplysningane vi har henta om deg, må kontrollerast manuelt.',
        kontaktOssTekstNy: 'for å bli registrert som arbeidssøkjar',
        kontaktOssLenke: 'https://www.nav.no/kontaktoss#chat-med-oss',
        kontaktOssLenkeTekst: 'Ta kontakt med Nav',
    },
    en: {
        overskriftNy: 'You must be registered as a jobseeker by an advisor',
        innholdNy: 'Some of the information we have obtained about you must be checked manually.',
        kontaktOssTekstNy: 'to become registered as a jobseeker',
        kontaktOssLenke: 'https://www.nav.no/kontaktoss#chat-med-oss',
        kontaktOssLenkeTekst: 'Contact Nav',
    },
};

export default async function Page({ params }: NextPageProps) {
    const { lang } = await params;
    const sprak = lang ?? 'nb';

    const tekst = lagHentTekstForSprak(TEKSTER, sprak);

    return (
        <Alert variant="info">
            <LoggVisning />
            <SettSprakIDekorator sprak={sprak} />
            <Heading spacing size="small" level="1">
                {tekst('overskriftNy')}
            </Heading>
            <BodyLong spacing>{tekst('innholdNy')}</BodyLong>
            <BodyLong spacing>
                <Link href={tekst('kontaktOssLenke')}>{tekst('kontaktOssLenkeTekst')}</Link>{' '}
                {tekst('kontaktOssTekstNy')}.
            </BodyLong>
        </Alert>
    );
}
