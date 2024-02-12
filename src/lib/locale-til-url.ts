function localeTilUrl(locale?: 'nb' | 'nn' | 'en'): '' | 'nn' | 'en' {
    if (!locale || locale === 'nb') {
        return '';
    }

    return locale;
}

export default localeTilUrl;
