import { Box, Button, Heading } from '@navikt/ds-react';
import NextLink from 'next/link';

import { SkjemaSide } from '../../model/skjema';

interface Props {
    brukerMock?: boolean;
}

function DemoPanel({ brukerMock }: Props) {
    if (!brukerMock) return null;

    return (
        <Box className="text-center w-full max-w-full min-w-0" style={{ backgroundColor: 'var(--ax-warning-300)' }}>
            <Heading level="2" size="xlarge" className={'m-6'}>
                Demovalg
            </Heading>
            <Box
                className="m-2 w-full max-w-full min-w-0"
                style={{ backgroundColor: 'var(--ax-warning-100)' }}
                padding={{ xs: 'space-16', sm: 'space-40' }}
            >
                <div className="text-center">
                    <Heading level="3" size="large">
                        Velg side
                    </Heading>
                    <div className="text-center flex flex-col gap-4">
                        <p>
                            <NextLink href={`/opplysninger/${SkjemaSide.DinSituasjon}`} passHref>
                                <Button className="max-w-full">Standard registrering</Button>
                            </NextLink>
                        </p>
                        <p>
                            <NextLink href="/kvittering/" passHref>
                                <Button className="max-w-full" variant="secondary">
                                    Kvittering
                                </Button>
                            </NextLink>
                        </p>

                        <Heading level="4" size="medium">
                            Stoppsituasjoner
                        </Heading>
                        <p>
                            <NextLink href="/veiledning/oppholdstillatelse/" passHref>
                                <Button className="max-w-full" variant="secondary">
                                    Ikke bosatt etter folkeregisteret
                                </Button>
                            </NextLink>
                        </p>
                        <p>
                            <NextLink href="/veiledning/generell/" passHref>
                                <Button className="max-w-full" variant="secondary">
                                    Mangler opplysninger til å beslutte
                                </Button>
                            </NextLink>
                        </p>
                        <p>
                            <NextLink href="/veiledning/under-18/" passHref>
                                <Button className="max-w-full" variant="secondary">
                                    Under 18 år
                                </Button>
                            </NextLink>
                        </p>
                        <Heading level="4" size="medium">
                            Feilmeldinger
                        </Heading>
                        <p>
                            <NextLink href="/vedlikehold/" passHref>
                                <Button className="max-w-full" variant="secondary">
                                    Vedlikehold
                                </Button>
                            </NextLink>
                        </p>
                        <p>
                            <NextLink href="/feil/" passHref>
                                <Button className="max-w-full" variant="secondary">
                                    Feil
                                </Button>
                            </NextLink>
                        </p>
                    </div>
                </div>
            </Box>
        </Box>
    );
}

export default DemoPanel;
