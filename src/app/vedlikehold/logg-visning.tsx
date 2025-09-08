'use client';

import { useEffect } from 'react';
import { loggStoppsituasjon } from '@/lib/tracker';

export default function LoggVisning() {
    useEffect(() => {
        loggStoppsituasjon({
            situasjon: 'Arbeidssøkeren får ikke registrert seg pga nedetid',
        });
    }, []);
    return null;
}
