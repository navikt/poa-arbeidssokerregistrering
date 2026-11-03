import { DinSituasjon, JaEllerNei, Utdanningsnivaa } from '@navikt/arbeidssokerregisteret-utils';
import type { Page } from '@playwright/test';
import { awaitPageReady, chooseRadioByValue, expect, pressByKeyboard } from './uu-fixtures';

export type TestSprak = 'nb' | 'nn' | 'en';
export type Skjemaside = 1 | 2 | 3 | 4 | 5;
export type SkjemaPrefix = 'opplysninger' | 'oppdater-opplysninger';

const situasjonsvalgPerSide = new WeakMap<Page, string>();

const titler: Record<TestSprak, Record<Skjemaside, string>> = {
    nb: {
        1: 'Arbeidssøkerregistrering: Din arbeidssøkersituasjon',
        2: 'Arbeidssøkerregistrering: Hva er din siste jobb?',
        3: 'Arbeidssøkerregistrering: Utdanningsnivå',
        4: 'Arbeidssøkerregistrering: Hindringer',
        5: 'Arbeidssøkerregistrering: Er alle opplysningene dine riktige?',
    },
    nn: {
        1: 'Arbeidssøkjarregistrering: Din situasjon som arbeidssøkjar',
        2: 'Arbeidssøkjarregistrering: Kva var den siste jobben din?',
        3: 'Arbeidssøkjarregistrering: Høgaste fullførte utdanning',
        4: 'Arbeidssøkjarregistrering: Hindringar',
        5: 'Arbeidssøkjarregistrering: Er alle opplysningane dine rette?',
    },
    en: {
        1: 'Register as a Job Seeker: Your jobseeker situation',
        2: 'Register as a Job Seeker : What was your last job?',
        3: 'Register as a Job Seeker : Education',
        4: 'Register as a Job Seeker : Impediments',
        5: 'Register as a Job Seeker: Is the information correct?',
    },
};

const oppdateringstittel: Record<TestSprak, string> = {
    nb: 'Arbeidssøkerregistrering: Oppdater opplysninger',
    nn: 'Arbeidssøkjarregistrering: Oppdater opplysningar',
    en: 'Register as a Job Seeker: Is the information correct?',
};

export const skjematitler = titler;

function regexEksakt(tekst: string) {
    return new RegExp(`^${tekst.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
}

function sprakPrefiks(sprak: TestSprak) {
    return sprak === 'nb' ? '' : `/${sprak}`;
}

function sidesti(side: Skjemaside, sprak: TestSprak, prefix: SkjemaPrefix) {
    return `${sprakPrefiks(sprak)}/${prefix}/${side}`;
}

export async function ventPaSkjemaside(
    page: Page,
    side: Skjemaside,
    sprak: TestSprak = 'nb',
    prefix: SkjemaPrefix = 'opplysninger',
) {
    const title = prefix === 'oppdater-opplysninger' && side === 5 ? oppdateringstittel[sprak] : titler[sprak][side];
    await awaitPageReady(page, regexEksakt(title), sprak);
    await expect(page.locator(`#skjema-steg-${side}`)).toBeVisible();
    const pathname = await page.evaluate(() => window.location.pathname.replace(/\/$/, ''));
    expect(pathname.endsWith(sidesti(side, sprak, prefix))).toBe(true);
    return page.getByRole('main');
}

export async function startRegistrering(page: Page, sprak: TestSprak = 'nb') {
    await page.goto(sprak === 'nb' ? './start' : `./${sprak}/start`);
    await expect(page).toHaveURL(new RegExp(`${sprakPrefiks(sprak)}/opplysninger/1/?$`));
    await ventPaSkjemaside(page, 1, sprak);
    await expect(page.locator('#skjema-steg-1')).toBeFocused({ timeout: 10_000 });
}

export async function nesteSteg(
    page: Page,
    side: Skjemaside,
    sprak: TestSprak = 'nb',
    prefix: SkjemaPrefix = 'opplysninger',
): Promise<Skjemaside> {
    await ventPaSkjemaside(page, side, sprak, prefix);
    let nesteSide: Skjemaside = (side + 1) as Skjemaside;
    if (side === 1) {
        const checkedValue = await page
            .getByRole('radiogroup')
            .nth(0)
            .locator('input[type="radio"]:checked')
            .getAttribute('value');
        if (checkedValue) situasjonsvalgPerSide.set(page, checkedValue);
        if (checkedValue === DinSituasjon.ALDRI_HATT_JOBB) nesteSide = 3;
    } else if (side === 2 && situasjonsvalgPerSide.get(page) === DinSituasjon.VIL_FORTSETTE_I_JOBB) {
        nesteSide = 4;
    }
    const button = page.getByTestId('skjema-neste-steg');
    await pressByKeyboard(page, button);
    await ventPaSkjemaside(page, nesteSide, sprak, prefix);
    await expect(page.locator(`#skjema-steg-${nesteSide}`)).toBeFocused({ timeout: 10_000 });
    return nesteSide;
}

export async function fyllUtTilOppsummering(page: Page, sprak: TestSprak = 'nb') {
    await chooseRadioByValue(page, DinSituasjon.MISTET_JOBBEN, page.getByRole('radiogroup').nth(0));
    await nesteSteg(page, 1, sprak);
    await nesteSteg(page, 2, sprak);
    await chooseRadioByValue(page, Utdanningsnivaa.INGEN_UTDANNING, page.getByRole('radiogroup').nth(0));
    await nesteSteg(page, 3, sprak);
    await chooseRadioByValue(page, JaEllerNei.NEI, page.getByRole('radiogroup').nth(0));
    await chooseRadioByValue(page, JaEllerNei.NEI, page.getByRole('radiogroup').nth(1));
    await nesteSteg(page, 4, sprak);
}
