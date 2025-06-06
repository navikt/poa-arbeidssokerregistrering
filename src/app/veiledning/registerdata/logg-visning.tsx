'use client';

import { useEffect } from 'react';
import { loggStoppsituasjon } from '@/lib/amplitude';

export default function LoggVisning() {
    useEffect(() => {
        loggStoppsituasjon({
            situasjon: 'Arbeidssøkeren kunne ikke verifiseres etter registerdata',
        });
    }, []);
    return null;
}
