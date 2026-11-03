'use client';

import { Button } from '@navikt/ds-react';
import NextLink from 'next/link';

type StartRegistreringLenkeProps = {
    href: string;
    tekst: string;
};

export default function StartRegistreringLenke({ href, tekst }: StartRegistreringLenkeProps) {
    return (
        <Button as={NextLink} href={href}>
            {tekst}
        </Button>
    );
}
