import { assertAxeClean, assertReflow, assertTextSpacing, awaitPageReady, expect, test } from './uu-fixtures';

type SideCase = {
    navn: string;
    route: string;
    sprak: 'nb' | 'nn' | 'en';
    heading: string;
    title: string;
    handling: { type: 'link' | 'button'; navn: string | RegExp };
    kommerFraDagpenger?: boolean;
};

const standardTittel = 'Arbeidssøkerregistrering';
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const lenkePanelNavn = (title: string) => new RegExp(`^${escapeRegex(title)}(?:\\s|$)`);

const sider: SideCase[] = [
    ...[
        {
            sprak: 'nb',
            route: 'feil',
            heading: 'Beklager, teknisk feil',
            handling: 'Kontakt teknisk brukerstøtte dersom problemene vedvarer.',
        },
        {
            sprak: 'nn',
            route: 'nn/feil',
            heading: 'Vi beklagar, men det har oppstått ein teknisk feil',
            handling: 'Kontakt teknisk brukarstøtte dersom problema varer ved.',
        },
        {
            sprak: 'en',
            route: 'en/feil',
            heading: 'Sorry, technical error',
            handling: 'Contact technical support if the problems persist.',
        },
    ].map(({ sprak, route, heading, handling }) => ({
        navn: `${route} (${sprak})`,
        route,
        sprak: sprak as SideCase['sprak'],
        heading,
        title: standardTittel,
        handling: { type: 'link' as const, navn: handling },
    })),
    ...[
        {
            sprak: 'nb',
            prefix: '',
            heading: 'Du må registreres som arbeidssøker av en veileder',
            handling: 'Ta kontakt med Nav',
        },
        {
            sprak: 'nn',
            prefix: 'nn/',
            heading: 'Ein rettleiar må registrere deg som arbeidssøkjar',
            handling: 'Ta kontakt med Nav',
        },
        {
            sprak: 'en',
            prefix: 'en/',
            heading: 'You must be registered as a jobseeker by an advisor',
            handling: 'Contact Nav',
        },
    ].map(({ sprak, prefix, heading, handling }) => ({
        navn: `${prefix}veiledning/oppholdstillatelse (${sprak})`,
        route: `${prefix}veiledning/oppholdstillatelse`,
        sprak: sprak as SideCase['sprak'],
        heading,
        title: standardTittel,
        handling: { type: 'link' as const, navn: handling },
    })),
    ...[
        { sprak: 'nb', prefix: '' },
        { sprak: 'nn', prefix: 'nn/' },
        { sprak: 'en', prefix: 'en/' },
    ].map(({ sprak, prefix }) => ({
        navn: `${prefix}veiledning/registerdata (${sprak}; innhold på bokmål)`,
        route: `${prefix}veiledning/registerdata`,
        sprak: sprak as SideCase['sprak'],
        heading: 'Vi kan dessverre ikke registrere deg som arbeidssøker',
        title: standardTittel,
        handling: { type: 'link' as const, navn: 'kontakte oss' },
    })),
    {
        navn: 'veiledning/generell (nb)',
        route: 'veiledning/generell',
        sprak: 'nb',
        heading: 'Du må registreres som arbeidssøker av en veileder',
        title: standardTittel,
        handling: { type: 'link', navn: 'Ta kontakt med Nav' },
    },
    ...[
        {
            sprak: 'nb',
            prefix: '',
            heading: 'Du ønsker å registrere deg som arbeidssøker',
            title: 'Du trenger samtykke for å registrere deg som arbeidssøker',
            handling: 'Samtykke fra foresatte',
        },
        {
            sprak: 'nn',
            prefix: 'nn/',
            heading: 'Du ønskjer å registrera deg som arbeidssøkjar',
            title: 'Du treng samtykke for å registrera deg som arbeidssøkjar',
            handling: 'Samtykke frå føresette',
        },
        {
            sprak: 'en',
            prefix: 'en/',
            heading: 'You want to register as a job seeker',
            title: 'You need consent to register as a job seeker',
            handling: 'Consent from guardians',
        },
    ].map(({ sprak, prefix, heading, title, handling }) => ({
        navn: `${prefix}veiledning/under-18 (${sprak}; aktiv oppgavekvittering)`,
        route: `${prefix}veiledning/under-18`,
        sprak: sprak as SideCase['sprak'],
        heading,
        title,
        handling: { type: 'link' as const, navn: lenkePanelNavn(handling) },
    })),
    ...[
        {
            sprak: 'nb',
            prefix: '',
            heading: 'Du er registrert som arbeidssøker',
            title: 'Du er nå registrert som arbeidssøker',
            handling: 'Bekreft at du vil være registrert som arbeidssøker',
        },
        {
            sprak: 'nn',
            prefix: 'nn/',
            heading: 'Du er registrert som arbeidssøkjar',
            title: 'Du er no registrert som arbeidssøkjar',
            handling: 'Stadfest at du vil vera registrert som arbeidssøkjar',
        },
        {
            sprak: 'en',
            prefix: 'en/',
            heading: 'You are registered as a jobseeker',
            title: 'You are now registered as a jobseeker',
            handling: 'Confirm that you want to be registered as a jobseeker',
        },
    ].flatMap(({ sprak, prefix, heading, title, handling }) => [
        {
            navn: `${prefix}kvittering (${sprak}; standard)`,
            route: `${prefix}kvittering`,
            sprak: sprak as SideCase['sprak'],
            heading,
            title,
            handling: { type: 'link' as const, navn: lenkePanelNavn(handling) },
            kommerFraDagpenger: false,
        },
        {
            navn: `${prefix}kvittering (${sprak}; fra dagpenger)`,
            route: `${prefix}kvittering`,
            sprak: sprak as SideCase['sprak'],
            heading,
            title,
            handling: {
                type: 'button' as const,
                navn:
                    sprak === 'nb'
                        ? 'Fortsett på søknad om dagpenger'
                        : sprak === 'nn'
                          ? 'Fortsett på søknad om dagpengar'
                          : 'Continue your application for unemployment benefit',
            },
            kommerFraDagpenger: true,
        },
    ]),
    {
        navn: 'finnes-ikke/ukjent (404)',
        route: 'finnes-ikke/ukjent',
        sprak: 'nb',
        heading: 'Beklager, vi fant ikke siden',
        title: standardTittel,
        handling: { type: 'link', navn: 'Gå til forsiden' },
    },
    ...[
        {
            sprak: 'nb',
            route: './',
            heading: 'Arbeidssøkerregistrering',
            title: 'Arbeidssøkerregistrering',
            handling: 'Start registrering',
        },
        {
            sprak: 'nn',
            route: 'nn',
            heading: 'Arbeidssøkarregistrering',
            title: standardTittel,
            handling: 'Start registrering',
        },
        {
            sprak: 'en',
            route: 'en',
            heading: 'Job seeker registration',
            title: standardTittel,
            handling: 'Start registration',
        },
    ].map(({ sprak, route, heading, title, handling }) => ({
        navn: `mock-forside ${route} (${sprak})`,
        route,
        sprak: sprak as SideCase['sprak'],
        heading,
        title,
        handling: { type: 'button' as const, navn: handling },
    })),
];

function exactTitle(title: string) {
    return new RegExp(`^${escapeRegex(title)}$`);
}

async function openAndCheck(page: Parameters<typeof awaitPageReady>[0], side: SideCase) {
    if (side.kommerFraDagpenger !== undefined) {
        await page.addInitScript((kommerFraDagpenger) => {
            if (kommerFraDagpenger) {
                window.sessionStorage.setItem('kommerFraDagpenger', 'true');
            } else {
                window.sessionStorage.removeItem('kommerFraDagpenger');
            }
        }, side.kommerFraDagpenger);
    }

    // Unknown routes may return HTTP 200 when Next.js streams its 404 UI; assert the actual 404 page below.
    await page.goto(side.route);

    const main = await awaitPageReady(page, exactTitle(side.title), side.sprak);
    await expect(main.getByRole('heading', { level: 1, name: side.heading, exact: true })).toBeVisible();
    const primaryHandling = main.getByRole(side.handling.type, {
        name: side.handling.navn,
        exact: typeof side.handling.navn === 'string',
    });
    await expect(primaryHandling, `Primary handling is inside main on ${side.navn}`).toBeVisible();
    if (side.handling.type === 'button') {
        // Aksel 8 gir Button as="a" og Button as={NextLink} rollen button.
        await expect(primaryHandling).toHaveAttribute('href', /^(?:https?:\/\/|\/arbeid\/registrering\/)/);
    }
    return main;
}

// Testene dekker mock-forsiden og interne veilednings-/kvitteringssider. Den eksterne innbyggerforsiden er utenfor scope.
// U18-mocken aktiverer oppgavekvitteringen; andre servervalgte komponentvarianter krever egne komponenttester.
// Manglende snapshot/avsluttet periode er server-mocktilstander og stubbes ikke med page.route eller auth-cookies.
for (const side of sider) {
    test.describe(`${side.navn} @uu`, () => {
        test('har forventet innhold og ingen axe-brudd', async ({ page }, testInfo) => {
            await openAndCheck(page, side);
            await assertAxeClean(page, testInfo, `${side.navn} | ${side.title} | hele siden`);
        });

        test('reflow ved 320 px', async ({ page }) => {
            await openAndCheck(page, side);
            await assertReflow(page, `${side.navn} | ${side.title} | 320px`);
        });

        test('tåler økt tekstavstand', async ({ page }) => {
            await openAndCheck(page, side);
            await assertTextSpacing(page, `${side.navn} | ${side.title} | tekstavstand`);
        });
    });
}
