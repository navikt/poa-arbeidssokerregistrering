'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import NyKvittering from '@/components/kvittering/ny-kvittering';
import SettSprakIDekorator from '@/components/sett-sprak-i-dekorator';
import { loggAktivitet, loggFlyt } from '@/lib/tracker';

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
