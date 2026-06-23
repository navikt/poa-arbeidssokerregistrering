import { BodyShort, Box, Heading, Link, List, VStack } from '@navikt/ds-react';
import { ListItem } from '@navikt/ds-react/List';

export default function NotFound() {
    return (
        <Box data-aksel-template="404-v3">
            <VStack gap="space-64">
                <VStack gap="space-16">
                    <Heading level="1" size="large">
                        Beklager, vi fant ikke siden
                    </Heading>
                    <BodyShort>Denne siden kan være slettet eller flyttet, eller det er en feil i lenken.</BodyShort>
                    <List>
                        <ListItem>Bruk gjerne søket eller menyen</ListItem>
                        <ListItem>
                            <Link href="https://www.nav.no">Gå til forsiden</Link>
                        </ListItem>
                    </List>
                </VStack>
                <div>
                    <Heading level="2" size="large" spacing>
                        Page not found
                    </Heading>
                    <BodyShort spacing>The page you requested cannot be found.</BodyShort>
                    <BodyShort>
                        Go to the <Link href="https://www.nav.no">front page</Link>, or use one of the links in the
                        menu.
                    </BodyShort>
                </div>
            </VStack>
        </Box>
    );
}
