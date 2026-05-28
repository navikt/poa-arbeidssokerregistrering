'use client';

import { useEffect } from 'react';
import { useSkjemaState } from '@/contexts/skjema-state-context';

export default function HydrateSkjemaState({ eksisterendeOpplysninger }: { eksisterendeOpplysninger?: any }) {
    const { dispatch } = useSkjemaState();
    useEffect(() => {
        if (eksisterendeOpplysninger) {
            dispatch({ type: 'InitSkjema', value: eksisterendeOpplysninger });
        }
    }, []);
    return null;
}
