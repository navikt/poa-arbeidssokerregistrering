'use client';

import { erStottetSprak, Sprak } from '@navikt/arbeidssokerregisteret-utils';
import { useEffect } from 'react';
import { onLanguageSelect, setParams } from '@navikt/nav-dekoratoren-moduler';
import { useRouter } from 'next/navigation';

const getSprakAttribute = (sprak: Sprak) => {
    if (['nb', 'en', 'nn'].includes(sprak)) {
        return sprak;
    }
    return 'nb';
};

const SettSprakIDekorator = ({ sprak }: { sprak: Sprak }) => {
    const router = useRouter();

    onLanguageSelect((language) => {
        const [_leadingSlash, _arbeid, _registrering, _oldLocale, ...rest] = window.location.pathname.split('/');

        if (!erStottetSprak(_oldLocale)) {
            // språk er 'nb', så _oldLocale inneholder basePath
            rest.unshift(_oldLocale);
        }

        const slug = rest.join('/');
        const sprakUrl = language.locale === 'nb' ? '' : `/${language.locale}`;

        router.push(`${sprakUrl}/${slug}`);
    });

    useEffect(() => {
        setParams({ language: sprak });
        document.querySelector('html')?.setAttribute('lang', getSprakAttribute(sprak));
    }, [sprak]);
    return null;
};

export default SettSprakIDekorator;
