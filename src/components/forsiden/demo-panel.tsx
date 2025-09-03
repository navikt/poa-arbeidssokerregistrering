import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Box, Button, Heading } from '@navikt/ds-react';

import { SkjemaSide } from '../../model/skjema';

interface Props {
    brukerMock?: boolean;
}

function DemoPanel({ brukerMock }: Props) {
    const router = useRouter();
    if (!brukerMock) return null;
    const { visGammelDineOpplysninger } = router.query;

    return (
        <Box className="text-center" style={{ backgroundColor: 'var(--a-orange-200)' }}>
            <Heading level="2" size="xlarge" className={'mb-6'}>
                Demovalg
            </Heading>
            <div style={{ display: 'flex', justifyContent: 'space-between' }} className="flex-col sm:flex-row">
                <Box className={'mx-2'} style={{ backgroundColor: 'var(--a-orange-50)' }} padding="10">
                    <div className="text-center">
                        <Heading level="3" size="large">
                            Velg side
                        </Heading>
                        <div className="text-center flex flex-col gap-4">
                            <p>
                                <NextLink href={`/opplysninger/${SkjemaSide.DinSituasjon}`} passHref>
                                    <Button>Standard registrering</Button>
                                </NextLink>
                            </p>
                            <p>
                                <NextLink href="/kvittering/" passHref>
                                    <Button variant="secondary">Kvittering</Button>
                                </NextLink>
                            </p>

                            <Heading level="4" size="medium">
                                Stoppsituasjoner
                            </Heading>
                            <p>
                                <NextLink href="/veiledning/oppholdstillatelse/" passHref>
                                    <Button variant="secondary">Ikke bosatt etter folkeregisteret</Button>
                                </NextLink>
                            </p>
                            <p>
                                <NextLink href="/veiledning/registerdata/" passHref>
                                    <Button variant="secondary">Mangler opplysninger til å beslutte</Button>
                                </NextLink>
                            </p>
                            <p>
                                <NextLink href="/veiledning/under-18/" passHref>
                                    <Button variant="secondary">Under 18 år</Button>
                                </NextLink>
                            </p>
                            <Heading level="4" size="medium">
                                Feilmeldinger
                            </Heading>
                            <p>
                                <NextLink href="/vedlikehold/" passHref>
                                    <Button variant="secondary">Vedlikehold</Button>
                                </NextLink>
                            </p>
                            <p>
                                <NextLink href="/feil/" passHref>
                                    <Button variant="secondary">Feil</Button>
                                </NextLink>
                            </p>
                        </div>
                    </div>
                </Box>
                <Box className={'mx-2'} style={{ backgroundColor: 'var(--a-orange-50)' }} padding="10">
                    <Heading level="3" size="large">
                        Velg tekstversjon
                    </Heading>
                    <p>
                        <NextLink
                            href={`/${visGammelDineOpplysninger ? '' : '?visGammelDineOpplysninger=true'}`}
                            passHref
                        >
                            <Button variant="secondary">
                                Vis {visGammelDineOpplysninger ? 'ny' : 'gammel'} introtekst
                            </Button>
                        </NextLink>
                    </p>
                </Box>
            </div>
        </Box>
    );
}

export default DemoPanel;
