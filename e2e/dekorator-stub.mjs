const krevLokaltTestmiljo = () => {
    if (
        process.env.UU_TEST !== '1' ||
        process.env.ENABLE_MOCK !== 'enabled' ||
        process.env.NEXT_PUBLIC_ENABLE_MOCK !== 'enabled' ||
        process.env.NODE_ENV !== 'development' ||
        process.env.UU_DEKORATOR_SMOKE === '1' ||
        process.env.NAIS_CLUSTER_NAME !== undefined ||
        process.env.NAIS_APP_NAME !== undefined ||
        process.env.NAIS_NAMESPACE !== undefined
    ) {
        throw new Error(
            'Dekoratørstubben kan bare brukes i et eksplisitt lokalt UU-testmiljø, aldri i smoke eller Nais.',
        );
    }
};

krevLokaltTestmiljo();

const originalFetch = globalThis.fetch;
const dekoratorHosts = new Set(['www.nav.no', 'dekoratoren.ekstern.dev.nav.no']);
const dekoratorFixture = {
    headAssets: '<meta name="uu-dekorator" content="stub">',
    header: '<header data-testid="uu-dekorator-header"><p>Nav</p></header>',
    footer: '<footer data-testid="uu-dekorator-footer"><p>Nav</p></footer>',
    scripts: '<script>/* offline dekorator */</script>',
};

const sti = (url) => url.pathname.replace(/^\/dekoratoren(?=\/)/, '');

globalThis.fetch = async (input, init) => {
    krevLokaltTestmiljo();
    const url = new URL(input instanceof Request ? input.url : input);

    if (dekoratorHosts.has(url.hostname)) {
        const path = sti(url);

        if (path === '/ssr') {
            return Response.json(dekoratorFixture);
        }
        if (path === '/api/version') {
            return Response.json({ latestVersion: 'uu-stub' });
        }
        if (path === '/api/csp') {
            // Utviklingsbyggets evaluering tillates bare når denne lokale testpreloaden er aktiv.
            return Response.json({ 'script-src': ["'self'", "'unsafe-eval'"] });
        }

        throw new Error(`Offline dekoratørstub avviste ukjent URL: ${url.href}`);
    }

    if (['localhost', '127.0.0.1', '::1'].includes(url.hostname)) {
        return originalFetch(input, init);
    }

    throw new Error(`Offline test avviste ekstern fetch: ${url.href}`);
};
