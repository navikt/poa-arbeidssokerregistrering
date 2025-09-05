'use client';

import { useEffect } from 'react';
import { initTracker } from '@/lib/tracker';

interface Props {
    apiKey: string;
}

const InitTracker = ({ apiKey }: Props) => {
    useEffect(() => {
        initTracker({ apiKey });
    }, [apiKey]);

    return null;
};

export default InitTracker;
