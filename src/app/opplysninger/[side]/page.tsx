'use client';

import { useParams } from 'next/navigation';
import Skjema from '@/app/opplysninger/[side]/skjema';
import SettSprakIDekorator from '@/components/sett-sprak-i-dekorator';

export default function SkjemaSide() {
    const { side, lang } = useParams<any>();

    return (
        <>
            <SettSprakIDekorator sprak={lang ?? 'nb'} />
            <Skjema side={side} />
        </>
    );
}
