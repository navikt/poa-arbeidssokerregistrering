'use client';

import React, { useEffect } from 'react';
import { loggAktivitet, loggFlyt } from '@/lib/amplitude';
import NyKvittering from '@/components/kvittering/ny-kvittering';
import SettSprakIDekorator from '@/components/sett-sprak-i-dekorator';
import { useParams } from 'next/navigation';

const Kvittering = () => {
    const { lang } = useParams<any>();

    useEffect(() => {
        loggAktivitet({
            aktivitet: 'Viser kvittering',
        });
        loggFlyt({ hendelse: 'Registrering fullført' });
    }, []);

    return (
        <>
            <SettSprakIDekorator sprak={lang ?? 'nb'} />
            <NyKvittering />
        </>
    );
};

export default Kvittering;
