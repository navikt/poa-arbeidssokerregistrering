'use client';

import { useEffect } from 'react';
import { loggStoppsituasjon } from '@/lib/tracker';

export default function LoggVisning() {
    useEffect(() => {
        loggStoppsituasjon({
            situasjon: 'Arbeidssøkeren kunne ikke verifiseres etter registerdata',
        });
    }, []);
    return null;
}
