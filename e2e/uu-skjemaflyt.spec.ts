import { DinSituasjon, JaEllerNei, UtdanningGodkjentValg, Utdanningsnivaa } from '@navikt/arbeidssokerregisteret-utils';
import {
    assertAxeClean,
    assertReflow,
    assertTextSpacing,
    awaitPageReady,
    chooseRadioByValue,
    expect,
    pressByKeyboard,
    test,
} from './uu-fixtures';
import { nesteSteg, startRegistrering, ventPaSkjemaside } from './uu-skjemaflyt';

const sprak = ['nb', 'nn', 'en'] as const;
const receipt = {
    nb: { title: 'Du er nå registrert som arbeidssøker', heading: 'Du er registrert som arbeidssøker' },
    nn: { title: 'Du er no registrert som arbeidssøkjar', heading: 'Du er registrert som arbeidssøkjar' },
    en: { title: 'You are now registered as a jobseeker', heading: 'You are registered as a jobseeker' },
};
const endreLenker = {
    nb: [
        /endre svaret: situasjon/i,
        /endre svaret: siste stilling/i,
        /endre svaret: utdanning/i,
        /endre svaret: hindringer/i,
    ],
    nn: [
        /endre svaret: situasjon/i,
        /endre svaret: siste stilling/i,
        /endre svaret: utdanning/i,
        /endre svaret: hindringar/i,
    ],
    en: [
        /change your reply: situation/i,
        /change your reply: last position/i,
        /change your reply: education/i,
        /change your reply: challenges/i,
    ],
};

function exact(text: string) {
    return new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
}

for (const language of sprak) {
    test(`@uu registrering på ${language}: keyboardflyt, fokus, språk og axe`, async ({ page }, testInfo) => {
        await startRegistrering(page, language);
        for (const side of [1, 2, 3, 4] as const) {
            await ventPaSkjemaside(page, side, language);
            if (side === 1) {
                await expect(page.getByRole('radiogroup').nth(0)).toHaveAccessibleName(/\S/);
            }
            if (side === 3) {
                const educationGroups = page.getByRole('radiogroup');
                await expect(educationGroups).toHaveCount(3);
                for (let index = 0; index < 3; index += 1) {
                    await expect(educationGroups.nth(index)).toHaveAccessibleName(/\S/);
                }
            }
            if (side === 4) {
                await expect(page.getByRole('radiogroup')).toHaveCount(2);
                await expect(page.getByRole('radiogroup').nth(0)).toHaveAccessibleName(/\S/);
                await expect(page.getByRole('radiogroup').nth(1)).toHaveAccessibleName(/\S/);
            }
            await assertAxeClean(page, testInfo, `registrering-${language}-steg-${side}`);

            if (side === 1) {
                await chooseRadioByValue(page, DinSituasjon.MISTET_JOBBEN, page.getByRole('radiogroup').nth(0));
            } else if (side === 3) {
                await chooseRadioByValue(page, Utdanningsnivaa.INGEN_UTDANNING, page.getByRole('radiogroup').nth(0));
                await expect(page.getByRole('radiogroup')).toHaveCount(1);
                await assertAxeClean(page, testInfo, `registrering-${language}-utdanning-uten-oppfolgere`);
            } else if (side === 4) {
                await chooseRadioByValue(page, JaEllerNei.NEI, page.getByRole('radiogroup').nth(0));
                await chooseRadioByValue(page, JaEllerNei.NEI, page.getByRole('radiogroup').nth(1));
            }
            if (side < 4) await nesteSteg(page, side, language);
            else await nesteSteg(page, 4, language);
            if (side === 4) {
                const summary = await ventPaSkjemaside(page, 5, language);
                const editLinks = summary.getByRole('link', { name: /endre svaret|change your reply/i });
                await expect(editLinks).toHaveCount(4);
                for (const editName of endreLenker[language]) {
                    await expect(summary.getByRole('link', { name: editName })).toHaveCount(1);
                }
                await assertAxeClean(page, testInfo, `registrering-${language}-oppsummering`);
                await pressByKeyboard(page, page.getByTestId('fullfor-registrering'));
                await expect(page).toHaveURL(/\/kvittering\/?$/);
                await awaitPageReady(page, exact(receipt[language].title), language);
                await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveText(
                    receipt[language].heading,
                );
                await assertAxeClean(page, testInfo, `registrering-${language}-kvittering`);
            }
        }
    });
}

test('@uu registrering: full skjemaflyt tåler 320 px og tekstavstand', async ({ page }) => {
    await startRegistrering(page);
    await assertReflow(page, 'registrering-side-1');
    await assertTextSpacing(page, 'registrering-side-1');
    await chooseRadioByValue(page, DinSituasjon.MISTET_JOBBEN, page.getByRole('radiogroup').nth(0));
    await nesteSteg(page, 1);
    await assertReflow(page, 'registrering-side-2');
    await assertTextSpacing(page, 'registrering-side-2');
    await nesteSteg(page, 2);
    await assertReflow(page, 'registrering-side-3');
    await assertTextSpacing(page, 'registrering-side-3');
    await chooseRadioByValue(page, Utdanningsnivaa.INGEN_UTDANNING, page.getByRole('radiogroup').nth(0));
    await nesteSteg(page, 3);
    await assertReflow(page, 'registrering-side-4');
    await assertTextSpacing(page, 'registrering-side-4');
    await chooseRadioByValue(page, JaEllerNei.NEI, page.getByRole('radiogroup').nth(0));
    await chooseRadioByValue(page, JaEllerNei.NEI, page.getByRole('radiogroup').nth(1));
    await nesteSteg(page, 4);
    await assertReflow(page, 'registrering-oppsummering');
    await assertTextSpacing(page, 'registrering-oppsummering');
});

test('@uu registrering: ALDRI_HATT_JOBB hopper over siste jobb', async ({ page }, testInfo) => {
    await startRegistrering(page);
    await assertAxeClean(page, testInfo, 'aldri-hatt-jobb-side-1');
    await chooseRadioByValue(page, DinSituasjon.ALDRI_HATT_JOBB, page.getByRole('radiogroup').nth(0));
    expect(await nesteSteg(page, 1)).toBe(3);
    await assertAxeClean(page, testInfo, 'aldri-hatt-jobb-side-3');
    await chooseRadioByValue(page, Utdanningsnivaa.INGEN_UTDANNING, page.getByRole('radiogroup').nth(0));
    await nesteSteg(page, 3);
    await assertAxeClean(page, testInfo, 'aldri-hatt-jobb-side-4');
    await chooseRadioByValue(page, JaEllerNei.NEI, page.getByRole('radiogroup').nth(0));
    await chooseRadioByValue(page, JaEllerNei.NEI, page.getByRole('radiogroup').nth(1));
    await nesteSteg(page, 4);
    const summary = await ventPaSkjemaside(page, 5);
    await expect(summary.getByRole('link', { name: /stilling|position/i })).toHaveCount(0);
    await expect(summary.getByRole('link', { name: /situasjon|situation/i })).toHaveCount(1);
    await expect(summary.getByRole('link', { name: /utdanning|education/i })).toHaveCount(1);
    await expect(summary.getByRole('link', { name: /hindringer|hindringar|challenges/i })).toHaveCount(1);
    await assertAxeClean(page, testInfo, 'aldri-hatt-jobb-oppsummering');
});

test('@uu registrering: VIL_FORTSETTE_I_JOBB hopper over utdanning', async ({ page }, testInfo) => {
    await startRegistrering(page);
    await assertAxeClean(page, testInfo, 'fortsette-i-jobb-side-1');
    await chooseRadioByValue(page, DinSituasjon.VIL_FORTSETTE_I_JOBB, page.getByRole('radiogroup').nth(0));
    expect(await nesteSteg(page, 1)).toBe(2);
    await assertAxeClean(page, testInfo, 'fortsette-i-jobb-side-2');
    expect(await nesteSteg(page, 2)).toBe(4);
    await assertAxeClean(page, testInfo, 'fortsette-i-jobb-side-4');
    await chooseRadioByValue(page, JaEllerNei.NEI, page.getByRole('radiogroup').nth(0));
    await chooseRadioByValue(page, JaEllerNei.NEI, page.getByRole('radiogroup').nth(1));
    await nesteSteg(page, 4);
    const summary = await ventPaSkjemaside(page, 5);
    await expect(summary.getByRole('link', { name: /siste stilling|last position/i })).toHaveCount(1);
    await expect(summary.getByRole('link', { name: /education|utdanning/i })).toHaveCount(0);
    await expect(summary.getByRole('link', { name: /situasjon|situation/i })).toHaveCount(1);
    await expect(summary.getByRole('link', { name: /hindringer|hindringar|challenges/i })).toHaveCount(1);
    await assertAxeClean(page, testInfo, 'fortsette-i-jobb-oppsummering');
});

test('@uu registrering: utdanningsoppfølgere vises og skjules med valgt nivå', async ({ page }, testInfo) => {
    await startRegistrering(page);
    await chooseRadioByValue(page, DinSituasjon.MISTET_JOBBEN, page.getByRole('radiogroup').nth(0));
    await nesteSteg(page, 1);
    await nesteSteg(page, 2);
    await assertAxeClean(page, testInfo, 'utdanning-uten-oppfolgere');
    await chooseRadioByValue(page, Utdanningsnivaa.HOYERE_UTDANNING_1_TIL_4, page.getByRole('radiogroup').nth(0));
    await expect(page.getByRole('radiogroup')).toHaveCount(3);
    await expect(page.getByRole('radiogroup').nth(1)).toHaveAccessibleName(/\S/);
    await expect(page.getByRole('radiogroup').nth(2)).toHaveAccessibleName(/\S/);
    await chooseRadioByValue(page, UtdanningGodkjentValg.JA, page.getByRole('radiogroup').nth(1));
    await chooseRadioByValue(page, JaEllerNei.JA, page.getByRole('radiogroup').nth(2));
    await assertAxeClean(page, testInfo, 'utdanning-oppfolgere-synlige');
    await chooseRadioByValue(page, Utdanningsnivaa.INGEN_UTDANNING, page.getByRole('radiogroup').nth(0));
    await expect(page.getByRole('radiogroup')).toHaveCount(1);
    await assertAxeClean(page, testInfo, 'utdanning-oppfolgere-skjulte');
});

test('@uu registrering: siste stilling har navngitt ja/nei-gruppe ved nyutdannet valg', async ({ page }, testInfo) => {
    await startRegistrering(page);
    await chooseRadioByValue(page, DinSituasjon.AKKURAT_FULLFORT_UTDANNING, page.getByRole('radiogroup').nth(0));
    await nesteSteg(page, 1);
    const group = page.getByRole('radiogroup', { name: /har du hatt jobb|have you had a job/i });
    await expect(group).toHaveCount(1);
    await expect(group.getByRole('radio')).toHaveCount(2);
    await expect(group.getByRole('radio').nth(0)).toBeVisible();
    await expect(group.getByRole('radio').nth(1)).toBeVisible();
    await assertAxeClean(page, testInfo, 'nyutdannet-side-2-siste-stilling');
});
