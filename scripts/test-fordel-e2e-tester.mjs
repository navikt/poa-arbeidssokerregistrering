import assert from 'node:assert/strict';
import test from 'node:test';
import { fordelTestlister } from './fordel-e2e-tester.mjs';

function lagSpec(file, line, title, id, suites = []) {
    return {
        title,
        id,
        file,
        line,
        column: 5,
        tests: [
            { projectId: 'chromium', projectName: 'chromium' },
            { projectId: 'chromium-narrow', projectName: 'chromium-narrow' },
        ],
        suites,
    };
}

function lagReport() {
    const suites = [];
    for (const file of ['a.spec.ts', 'b.spec.ts']) {
        const directSpecs = Array.from({ length: 5 }, (_, index) =>
            lagSpec(file, index + 10, `test ${index}`, `${file}-direct-${index}`),
        );
        const nestedSpecs = Array.from({ length: 5 }, (_, index) =>
            lagSpec(file, index + 30, `nested test ${index}`, `${file}-nested-${index}`),
        );
        suites.push({
            title: file,
            file,
            specs: directSpecs,
            suites: [
                {
                    title: 'outer describe',
                    file,
                    specs: [],
                    suites: [
                        {
                            title: 'nested describe',
                            file,
                            specs: nestedSpecs,
                        },
                    ],
                },
            ],
        });
    }
    return { config: { rootDir: '/repo/e2e' }, suites };
}

function antallPerGruppe(shards, predicate) {
    return shards.map((shard) => shard.filter(predicate).length);
}

test('fordeler deterministisk med balanserte file/prosjekt-grupper og totalt antall', () => {
    const report = lagReport();
    const first = fordelTestlister(report, 4);
    const second = fordelTestlister(report, 4);

    assert.deepEqual(first, second);
    assert.equal(
        first.reduce((sum, shard) => sum + shard.length, 0),
        40,
    );
    assert.ok(Math.max(...first.map((shard) => shard.length)) - Math.min(...first.map((shard) => shard.length)) <= 1);

    for (const file of ['a.spec.ts', 'b.spec.ts']) {
        for (const project of ['chromium', 'chromium-narrow']) {
            const counts = antallPerGruppe(first, (selector) => selector.startsWith(`[${project}] › ${file}:`));
            assert.ok(Math.max(...counts) - Math.min(...counts) <= 1, `${file} / ${project}: ${counts}`);
        }
    }
});

test('inkluderer alle spec.id+projectId én gang og lar nye tester inngå automatisk', () => {
    const report = lagReport();
    report.suites[0].specs.push(lagSpec('a.spec.ts', 99, 'newly added test', 'new-test'));
    const shards = fordelTestlister(report, 4);
    const selectors = shards.flat();

    assert.equal(selectors.length, 42);
    assert.equal(new Set(selectors).size, selectors.length);
    assert.equal(selectors.filter((selector) => selector.includes('newly added test')).length, 2);
});

test('utelater filtoppsettittel og tar med nøstede describe-titler', () => {
    const [shard] = fordelTestlister(lagReport(), 1);
    assert.ok(shard.includes('[chromium] › a.spec.ts:30:5 › outer describe › nested describe › nested test 0'));
    assert.ok(shard.includes('[chromium] › a.spec.ts:10:5 › test 0'));
    assert.ok(shard.every((selector) => !selector.includes('a.spec.ts ›')));
});

test('beholder gyldige spesialtegn i selektorer, men avviser separator og linjeskift', () => {
    const report = lagReport();
    report.suites[0].specs[0].title = 'quotes " and brackets [id]';
    assert.ok(
        fordelTestlister(report, 4)
            .flat()
            .some((selector) => selector.endsWith(' › quotes " and brackets [id]')),
    );

    for (const invalidTitle of [
        'not › supported',
        'not\nsupported',
        'escaped \\› still unsupported',
        ' padded',
        'padded ',
    ]) {
        const invalidReport = lagReport();
        invalidReport.suites[0].specs[0].title = invalidTitle;
        assert.throws(() => fordelTestlister(invalidReport, 4), /unsupported/u);
    }
});

test('avviser ugyldig shard count, tom rapport og flere shards enn tester', () => {
    assert.throws(() => fordelTestlister(lagReport(), 0), /positive integer/u);
    assert.throws(() => fordelTestlister(lagReport(), 1.5), /positive integer/u);
    assert.throws(() => fordelTestlister({ config: { rootDir: '/repo/e2e' }, suites: [] }, 1), /no test entries/u);
    assert.throws(() => fordelTestlister(lagReport(), 41), /Every shard must contain/u);
});

test('avviser dupliserte testidentiteter og selektorer', () => {
    const duplicateIdentity = lagReport();
    duplicateIdentity.suites[1].specs[0].id = duplicateIdentity.suites[0].specs[0].id;
    assert.throws(() => fordelTestlister(duplicateIdentity, 4), /Duplicate test identity/u);

    const duplicateSelector = lagReport();
    duplicateSelector.suites[0].specs[1] = { ...duplicateSelector.suites[0].specs[0], id: 'different-id' };
    assert.throws(() => fordelTestlister(duplicateSelector, 4), /Duplicate test selector/u);
});

test('avviser tittelstier der Playwrights prefiksmatching ville valgt samme test flere ganger', () => {
    for (const nestedFirst of [false, true]) {
        const groups = [
            { title: 'group', specs: [lagSpec('a.spec.ts', 10, 'prefix', 'prefix-test')] },
            {
                title: 'group',
                suites: [{ title: 'prefix', specs: [lagSpec('a.spec.ts', 20, 'child', 'nested-test')] }],
            },
        ];
        const report = {
            config: { rootDir: '/repo/e2e' },
            suites: [{ title: 'a.spec.ts', suites: nestedFirst ? groups.reverse() : groups }],
        };
        assert.throws(() => fordelTestlister(report, 4), /Overlapping test title paths/u);
    }
});
