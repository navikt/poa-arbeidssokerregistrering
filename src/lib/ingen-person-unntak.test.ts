// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * Statisk vakt for internkontroll: koden skal ikke behandle enkeltpersoner ulikt.
 * Testen feiler hvis det dukker opp hardkodede personnummer eller logikk som
 * sammenligner eller forgrener på brukerens identitet.
 *
 * Filer som har en legitim grunn til å lese innholdet i identiteten, står i GODKJENTE_FILER.
 * Endringer i listen skal begrunnes og gås gjennom av teamet. Se docs/integritetstesting.md.
 */
const GODKJENTE_FILER: Record<string, string> = {
    'src/lib/personident-til-alder.ts':
        'Regner ut alder fra fødselsdato i identiteten. Brukes for veiledning under 18 år.',
};

const SRC = path.resolve(__dirname, '..');
const ROT = path.resolve(SRC, '..');

const erTestEllerMock = (fil: string) => /\.(test|spec|stories)\.tsx?$/.test(fil) || /mock/i.test(path.basename(fil));

function kildefiler(mappe: string): string[] {
    return readdirSync(mappe).flatMap((navn) => {
        const full = path.join(mappe, navn);
        if (statSync(full).isDirectory()) return kildefiler(full);
        return /\.(ts|tsx|js|jsx|mjs)$/.test(navn) && !erTestEllerMock(full) ? [full] : [];
    });
}

const ID = String.raw`(?:pid|identitetsnummer|personident|fnr\w*|dnr|ident)`;
const MONSTRE: { navn: string; regex: RegExp }[] = [
    { navn: 'hardkodet 11-sifret nummer', regex: /['"`]\d{11}['"`]/ },
    { navn: 'sammenligning mot identitet', regex: new RegExp(String.raw`\b${ID}\b\s*(?:===|!==|==|!=)`, 'i') },
    { navn: 'sammenligning mot identitet', regex: new RegExp(String.raw`(?:===|!==|==|!=)\s*[\w.?]*\b${ID}\b`, 'i') },
    { navn: 'switch på identitet', regex: new RegExp(String.raw`switch\s*\(\s*[\w.?]*\b${ID}\b`, 'i') },
    {
        navn: 'oppslag eller mønstersjekk på identitet',
        regex: new RegExp(
            String.raw`\.(?:includes|has|startsWith|endsWith|match|test|indexOf)\(\s*[\w.?]*\b${ID}\b`,
            'i',
        ),
    },
    {
        navn: 'mønstersjekk på identitet',
        regex: new RegExp(String.raw`\b${ID}\b[\w.?]*\.(?:startsWith|endsWith|match|includes)\(`, 'i'),
    },
];

describe('integritet: ingen unntak for enkeltpersoner', () => {
    const filer = kildefiler(SRC);

    test('finner kildefiler å skanne', () => {
        expect(filer.length).toBeGreaterThan(20);
    });

    test('ingen hardkodede personnummer eller forgrening på identitet', () => {
        const funn: string[] = [];
        for (const fil of filer) {
            const relativ = path.relative(ROT, fil).split(path.sep).join('/');
            if (relativ in GODKJENTE_FILER) continue;
            readFileSync(fil, 'utf8')
                .split('\n')
                .forEach((linje, i) => {
                    for (const { navn, regex } of MONSTRE) {
                        if (regex.test(linje)) funn.push(`${relativ}:${i + 1} (${navn}): ${linje.trim()}`);
                    }
                });
        }
        expect(funn).toEqual([]);
    });

    test('godkjente filer finnes fortsatt', () => {
        for (const fil of Object.keys(GODKJENTE_FILER)) {
            expect(statSync(path.join(ROT, fil)).isFile()).toBe(true);
        }
    });

    test('vakten oppdager et innplantet unntak', () => {
        const eksempler = [
            "if (identitetsnummer === '12345678910') return;",
            'if (pid !== spesialPerson) {',
            'switch (fnr) {',
            'if (unntak.includes(idporten.pid)) {',
            "if (pid.startsWith('01')) {",
        ];
        for (const kode of eksempler) {
            expect(
                MONSTRE.some(({ regex }) => regex.test(kode)),
                kode,
            ).toBe(true);
        }
    });
});
