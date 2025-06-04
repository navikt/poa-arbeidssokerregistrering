'use client';

import Skjema from '@/app/opplysninger/[side]/skjema';
import SettSprakIDekorator from '@/components/sett-sprak-i-dekorator';
import { useParams } from 'next/navigation';

export default function SkjemaSide() {
    const { side, sprak } = useParams<any>();

    return (
        <>
            <SettSprakIDekorator sprak={sprak} />
            <Skjema side={side} />
        </>
    );
}
