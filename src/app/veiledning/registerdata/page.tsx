import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import { Alert, BodyLong, Heading, Link } from '@navikt/ds-react';
import { NextPageProps } from '@/types/next';
import SettSprakIDekorator from '@/components/sett-sprak-i-dekorator';
import LoggVisning from '@/app/veiledning/registerdata/logg-visning';

const TEKSTER: Tekster<string> = {
    nb: {
        overskrift: 'Vi kan dessverre ikke registrere deg som arbeidssøker',
        innledning:
            'De opplysningene vi henter om deg fra folkeregisteret oppfyller ikke kravene til at du kan registrere deg som arbeidssøker.',
        folkeregisteretKontakt: 'Du kan kontakte folkeregisteret for å gjøre endringer i opplysningene dine',
        folkeregisteretLenke: 'https://www.skatteetaten.no/person/folkeregister/endre/',
        folkeregisteretLenkeTekst: 'på nettsiden deres.',
        vilDuHaHjelp: 'Vil du at vi skal hjelpe deg videre kan du',
        kontaktOssLenke: 'https://www.nav.no/kontaktoss#chat-med-oss',
        kontaktOssLenkeTekst: 'kontakte oss',
    },
};

const dialogUrl = process.env.NEXT_PUBLIC_DIALOG_URL!;

export default async function Registerdata({ params }: NextPageProps) {
    const { lang } = await params;
    const sprak = lang ?? 'nb';
    const tekst = lagHentTekstForSprak(TEKSTER, sprak);

    return (
        <Alert variant="warning">
            <SettSprakIDekorator sprak={sprak} />
            <LoggVisning />
            <Heading spacing size="small" level="1">
                {tekst('overskrift')}
            </Heading>
            <BodyLong spacing>{tekst('innledning')}</BodyLong>
            <BodyLong spacing>
                {tekst('folkeregisteretKontakt')}{' '}
                <Link href={tekst('folkeregisteretLenke')}>{tekst('folkeregisteretLenkeTekst')}</Link>
            </BodyLong>
            <BodyLong spacing>
                {tekst('vilDuHaHjelp')} <Link href={tekst('kontaktOssLenke')}>{tekst('kontaktOssLenkeTekst')}</Link>
                {''}.
            </BodyLong>
        </Alert>
    );
}
