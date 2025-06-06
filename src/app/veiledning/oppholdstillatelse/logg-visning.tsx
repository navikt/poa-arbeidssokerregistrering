'use client';

import { useEffect } from 'react';
import { loggStoppsituasjon } from '@/lib/amplitude';

export default function LoggVisning() {
    useEffect(() => {
        loggStoppsituasjon({
            situasjon: 'Arbeidssøkeren kan ikke registrere seg selv',
        });
    }, []);
    return null;
}
