'use client';

import { useEffect } from 'react';
import { loggStoppsituasjon } from '@/lib/tracker';

export default function LoggVisning() {
    useEffect(() => {
        loggStoppsituasjon({
            situasjon: 'Arbeidssøkeren kan ikke registrere seg selv',
        });
    }, []);
    return null;
}
