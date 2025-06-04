'use client';

import { useSkjemaState } from '@/contexts/skjema-state-context';
import { useEffect } from 'react';

export default function HydrateSkjemaState({ eksisterendeOpplysninger }: { eksisterendeOpplysninger?: any }) {
    const { dispatch } = useSkjemaState();
    useEffect(() => {
        if (eksisterendeOpplysninger) {
            dispatch({ type: 'InitSkjema', value: eksisterendeOpplysninger });
        }
    }, []);
    return null;
}
