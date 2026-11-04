import { generateMetadata as generateEnglishReceiptMetadata } from '@/app/[lang]/kvittering/layout';
import { generateMetadata as generateEnglishUpdateMetadata } from '@/app/[lang]/oppdater-opplysninger/[side]/layout';
import { generateMetadata as generateEnglishRegistrationMetadata } from '@/app/[lang]/opplysninger/[side]/layout';
import { generateMetadata as generateEnglishUnder18Metadata } from '@/app/[lang]/veiledning/under-18/layout';
import { generateMetadata as generateReceiptMetadata } from '@/app/kvittering/layout';
import { generateMetadata as generateUpdateMetadata } from '@/app/oppdater-opplysninger/[side]/layout';
import { generateMetadata as generateRegistrationMetadata } from '@/app/opplysninger/[side]/layout';
import { generateMetadata as generateUnder18Metadata } from '@/app/veiledning/under-18/layout';

const sprak = {
    nb: {
        registrering: [
            'Arbeidssøkerregistrering: Din arbeidssøkersituasjon',
            'Arbeidssøkerregistrering: Hva er din siste jobb?',
            'Arbeidssøkerregistrering: Utdanningsnivå',
            'Arbeidssøkerregistrering: Hindringer',
            'Arbeidssøkerregistrering: Er alle opplysningene dine riktige?',
        ],
        oppdatering: 'Arbeidssøkerregistrering: Oppdater opplysninger',
        kvittering: 'Du er nå registrert som arbeidssøker',
        under18: 'Du trenger samtykke for å registrere deg som arbeidssøker',
    },
    nn: {
        registrering: [
            'Arbeidssøkjarregistrering: Din situasjon som arbeidssøkjar',
            'Arbeidssøkjarregistrering: Kva var den siste jobben din?',
            'Arbeidssøkjarregistrering: Høgaste fullførte utdanning',
            'Arbeidssøkjarregistrering: Hindringar',
            'Arbeidssøkjarregistrering: Er alle opplysningane dine rette?',
        ],
        oppdatering: 'Arbeidssøkjarregistrering: Oppdater opplysningar',
        kvittering: 'Du er no registrert som arbeidssøkjar',
        under18: 'Du treng samtykke for å registrera deg som arbeidssøkjar',
    },
    en: {
        registrering: [
            'Register as a Job Seeker: Your jobseeker situation',
            'Register as a Job Seeker : What was your last job?',
            'Register as a Job Seeker : Education',
            'Register as a Job Seeker : Impediments',
            'Register as a Job Seeker: Is the information correct?',
        ],
        oppdatering: 'Register as a Job Seeker: Is the information correct?',
        kvittering: 'You are now registered as a jobseeker',
        under18: 'You need consent to register as a job seeker',
    },
} as const;

const params = (side: string, lang?: string) => Promise.resolve({ side, lang });

describe('metadata for form pages', () => {
    it.each(Object.entries(sprak))('uses the %s titles for registration pages', async (lang, expected) => {
        for (const [index, title] of expected.registrering.entries()) {
            await expect(
                generateRegistrationMetadata({ params: params(String(index + 1), lang), children: null }),
            ).resolves.toEqual({ title });
        }
    });

    it.each(Object.entries(sprak))('uses the %s title for the update summary', async (lang, expected) => {
        await expect(generateUpdateMetadata({ params: params('5', lang), children: null })).resolves.toEqual({
            title: expected.oppdatering,
        });
    });

    it('uses the generic title for an invalid side', async () => {
        await expect(
            generateRegistrationMetadata({ params: params('invalid', 'nb'), children: null }),
        ).resolves.toEqual({ title: 'Arbeidssøkerregistrering' });
    });

    it('defaults to the Norwegian Bokmål title when the language is omitted', async () => {
        await expect(generateRegistrationMetadata({ params: params('1'), children: null })).resolves.toEqual({
            title: sprak.nb.registrering[0],
        });
    });

    it('re-exports the same metadata function for language routes', () => {
        expect(generateEnglishRegistrationMetadata).toBe(generateRegistrationMetadata);
        expect(generateEnglishUpdateMetadata).toBe(generateUpdateMetadata);
    });
});

describe('metadata for the receipt page', () => {
    it.each(Object.entries(sprak))('uses the %s receipt title', async (lang, expected) => {
        await expect(generateReceiptMetadata({ params: Promise.resolve({ lang }), children: null })).resolves.toEqual({
            title: expected.kvittering,
        });
    });

    it('re-exports the same metadata function for the language route', () => {
        expect(generateEnglishReceiptMetadata).toBe(generateReceiptMetadata);
    });
});

describe('metadata for the under-18 guidance page', () => {
    it.each(Object.entries(sprak))('uses the %s under-18 title', async (lang, expected) => {
        await expect(generateUnder18Metadata({ params: Promise.resolve({ lang }), children: null })).resolves.toEqual({
            title: expected.under18,
        });
    });

    it('defaults to the Norwegian Bokmål title when the language is omitted', async () => {
        await expect(generateUnder18Metadata({ params: Promise.resolve({}), children: null })).resolves.toEqual({
            title: sprak.nb.under18,
        });
    });

    it('defaults to the Norwegian Bokmål title for an unknown language', async () => {
        await expect(
            generateUnder18Metadata({ params: Promise.resolve({ lang: 'unknown' }), children: null }),
        ).resolves.toEqual({ title: sprak.nb.under18 });
    });

    it('re-exports the same metadata function for the language route', () => {
        expect(generateEnglishUnder18Metadata).toBe(generateUnder18Metadata);
    });
});
