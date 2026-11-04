import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SEPARATOR = ' › ';

function sammenlignKodepunkter(first, second) {
    const firstPoints = Array.from(first, (character) => character.codePointAt(0));
    const secondPoints = Array.from(second, (character) => character.codePointAt(0));
    const sharedLength = Math.min(firstPoints.length, secondPoints.length);

    for (let index = 0; index < sharedLength; index += 1) {
        if (firstPoints[index] !== secondPoints[index]) return firstPoints[index] - secondPoints[index];
    }
    return firstPoints.length - secondPoints.length;
}

function sammenlignTittelsti(first, second) {
    const sharedLength = Math.min(first.length, second.length);
    for (let index = 0; index < sharedLength; index += 1) {
        const comparison = sammenlignKodepunkter(first[index], second[index]);
        if (comparison !== 0) return comparison;
    }
    return first.length - second.length;
}

function lesToken(value, description) {
    if (typeof value !== 'string' || value.length === 0) {
        throw new TypeError(`${description} must be a non-empty string`);
    }
    if (/[\r\n›]/u.test(value)) {
        throw new TypeError(`${description} contains unsupported newline or selector separator`);
    }
    if (value !== value.trim()) {
        throw new TypeError(`${description} contains unsupported leading or trailing whitespace`);
    }
    return value;
}

function krevObjekt(value, description) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw new TypeError(`${description} must be an object`);
    }
    return value;
}

function krevArray(value, description) {
    if (!Array.isArray(value)) throw new TypeError(`${description} must be an array`);
    return value;
}

function hentTestoppføringer(report) {
    krevObjekt(report, 'Playwright report');
    const config = krevObjekt(report.config, 'Playwright report config');
    lesToken(config.rootDir, 'config.rootDir');
    const rootSuites = krevArray(report.suites, 'report.suites');
    const entries = [];

    function besokSuite(suiteValue, titlePath, isFileSuite = false) {
        const suite = krevObjekt(suiteValue, 'suite');
        const nextTitlePath = isFileSuite ? titlePath : [...titlePath, lesToken(suite.title, 'suite.title')];
        const specs = suite.specs === undefined ? [] : krevArray(suite.specs, 'suite.specs');

        for (const specValue of specs) {
            const spec = krevObjekt(specValue, 'spec');
            const file = lesToken(spec.file, 'spec.file');
            const title = lesToken(spec.title, 'spec.title');
            if (!Number.isInteger(spec.line) || spec.line < 1)
                throw new TypeError('spec.line must be a positive integer');
            if (!Number.isInteger(spec.column) || spec.column < 1)
                throw new TypeError('spec.column must be a positive integer');
            const id = lesToken(spec.id, 'spec.id');
            const tests = krevArray(spec.tests, 'spec.tests');

            for (const testValue of tests) {
                const test = krevObjekt(testValue, 'spec test');
                const projectId = lesToken(test.projectId, 'test.projectId');
                const projectName = lesToken(test.projectName, 'test.projectName');
                const identity = JSON.stringify([id, projectId]);
                const fullTitlePath = [...nextTitlePath, title];
                const selector = `[${projectName}]${SEPARATOR}${file}:${spec.line}:${spec.column}${SEPARATOR}${fullTitlePath.join(SEPARATOR)}`;

                entries.push({
                    file,
                    projectName,
                    projectId,
                    id,
                    identity,
                    fullTitlePath,
                    line: spec.line,
                    column: spec.column,
                    selector,
                });
            }
        }

        const childSuites = suite.suites === undefined ? [] : krevArray(suite.suites, 'suite.suites');
        for (const childSuite of childSuites) besokSuite(childSuite, nextTitlePath);
    }

    for (const rootSuite of rootSuites) besokSuite(rootSuite, [], true);
    if (entries.length === 0) throw new Error('Playwright report contains no test entries');
    return entries;
}

export function fordelTestlister(report, shardCount) {
    if (!Number.isInteger(shardCount) || shardCount < 1) {
        throw new RangeError('shardCount must be a positive integer');
    }

    const entries = hentTestoppføringer(report);
    if (entries.length < shardCount) throw new Error('Every shard must contain at least one test');

    const identities = new Set();
    const selectors = new Set();
    const entriesByGroup = new Map();
    for (const entry of entries) {
        if (identities.has(entry.identity)) throw new Error(`Duplicate test identity: ${entry.identity}`);
        if (selectors.has(entry.selector)) throw new Error(`Duplicate test selector: ${entry.selector}`);
        const groupKey = JSON.stringify([entry.file, entry.projectName]);
        const group = entriesByGroup.get(groupKey) ?? [];
        for (const previous of group) {
            if (
                entry.fullTitlePath.every((title, index) => previous.fullTitlePath[index] === title) ||
                previous.fullTitlePath.every((title, index) => entry.fullTitlePath[index] === title)
            ) {
                throw new Error(`Overlapping test title paths: ${previous.selector} / ${entry.selector}`);
            }
        }
        group.push(entry);
        entriesByGroup.set(groupKey, group);
        identities.add(entry.identity);
        selectors.add(entry.selector);
    }

    entries.sort((first, second) => {
        return (
            sammenlignKodepunkter(first.file, second.file) ||
            sammenlignKodepunkter(first.projectName, second.projectName) ||
            sammenlignTittelsti(first.fullTitlePath, second.fullTitlePath) ||
            first.line - second.line ||
            first.column - second.column ||
            sammenlignKodepunkter(first.selector, second.selector) ||
            sammenlignKodepunkter(first.identity, second.identity)
        );
    });

    const shards = Array.from({ length: shardCount }, () => []);
    entries.forEach((entry, index) => {
        shards[index % shardCount].push(entry.selector);
    });

    const assignedIdentities = new Set();
    const assignedSelectors = new Set();
    const identityBySelector = new Map(entries.map((entry) => [entry.selector, entry.identity]));
    for (const shard of shards) {
        if (shard.length === 0) throw new Error('Every shard must contain at least one test');
        for (const selector of shard) {
            if (assignedSelectors.has(selector)) throw new Error(`Test selector assigned more than once: ${selector}`);
            const identity = identityBySelector.get(selector);
            if (!identity) throw new Error(`Unknown test selector assigned: ${selector}`);
            if (assignedIdentities.has(identity)) throw new Error(`Test identity assigned more than once: ${identity}`);
            assignedSelectors.add(selector);
            assignedIdentities.add(identity);
        }
    }
    if (assignedIdentities.size !== identities.size || assignedSelectors.size !== selectors.size) {
        throw new Error('Not every unique test identity and selector was assigned exactly once');
    }

    return shards;
}

async function main() {
    const [, , reportPath, outputDir, shardCountValue] = process.argv;
    if (!reportPath || !outputDir || !shardCountValue || process.argv.length !== 5) {
        throw new Error('Usage: node scripts/fordel-e2e-tester.mjs <list-report.json> <output-dir> <shard-count>');
    }
    if (!/^[1-9]\d*$/u.test(shardCountValue)) throw new Error('shard-count must be a positive integer');
    const shardCount = Number(shardCountValue);
    if (!Number.isSafeInteger(shardCount)) throw new Error('shard-count must be a safe integer');

    const report = JSON.parse(await readFile(reportPath, 'utf8'));
    const shards = fordelTestlister(report, shardCount);
    await mkdir(outputDir, { recursive: true });
    await Promise.all(
        shards.map((selectors, index) =>
            writeFile(resolve(outputDir, `shard-${index + 1}.txt`), `${selectors.join('\n')}\n`, 'utf8'),
        ),
    );
    shards.forEach((shard, index) => {
        console.log(`shard-${index + 1}: ${shard.length} tests`);
    });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
    main().catch((error) => {
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
    });
}
