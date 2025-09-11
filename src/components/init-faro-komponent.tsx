'use client';

import { useEffect } from 'react';
import { initFaro } from '@/faro/initFaro';

const InitFaroKomponent = () => {
    useEffect(() => {
        initFaro();
    }, []);

    return null;
};

export default InitFaroKomponent;
