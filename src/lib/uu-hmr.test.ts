// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { erKodeOppdatering, erUtviklingsHmr, lagHmrMeldingsfilter } from '../../e2e/uu-fixtures';

describe('HMR-isolasjon i UU-testene', () => {
    it.each([
        'ws://127.0.0.1:3000/arbeid/registrering/_next/hmr?id=syntetisk',
        'ws://localhost:3000/arbeid/registrering/_next/hmr',
        'ws://127.0.0.1:3000/arbeid/registrering/_next/webpack-hmr',
        'ws://localhost:3000/_next/webpack-hmr',
    ])('isolerer utviklingskanalen %s', (url) => {
        expect(erUtviklingsHmr(new URL(url))).toBe(true);
    });

    it.each([
        'ws://127.0.0.1:3000/arbeid/registrering/oppdateringer',
        'ws://127.0.0.1:6006/_next/hmr',
        'wss://www.nav.no/_next/hmr',
        'ws://127.0.0.1:3000/_next/hmr/annen-kanal',
    ])('lar andre kanaler være urørt: %s', (url) => {
        expect(erUtviklingsHmr(new URL(url))).toBe(false);
    });
});

describe('Filtrering av utviklingsmeldinger', () => {
    it.each([
        'addedPage',
        'removedPage',
        'reloadPage',
        'serverComponentChanges',
        'staticParamsChanged',
        'middlewareChanges',
        'clientChanges',
        'serverOnlyChanges',
        'built',
        'building',
    ])('filtrerer kodeoppdateringen %s', (type) => {
        expect(erKodeOppdatering(JSON.stringify({ type, errors: [] }))).toBe(true);
    });

    it.each([
        { type: 'sync', hash: 'syntetisk' },
        { type: 'serverError', errorJSON: '{"message":"syntetisk"}' },
        { type: 'runtimeErrors', errors: ['syntetisk'] },
        { type: 'built', errors: ['syntetisk kompileringsfeil'] },
        { type: 'ukjent-melding' },
    ])('videresender oppstartsdata, feil og ukjente meldinger: $type', (event) => {
        expect(erKodeOppdatering(JSON.stringify(event))).toBe(false);
    });

    it('videresender binære React-strømmer og meldinger som ikke er JSON', () => {
        expect(erKodeOppdatering(Buffer.from([0, 1, 2]))).toBe(false);
        expect(erKodeOppdatering('ikke JSON')).toBe(false);
        expect(erKodeOppdatering('null')).toBe(false);
    });
});

describe('HMR-synkronisering per forbindelse', () => {
    it('videresender første sync, men ikke senere vellykkede sync med samme eller endret hash', () => {
        const skalVideresende = lagHmrMeldingsfilter();
        expect(skalVideresende(JSON.stringify({ type: 'sync', hash: 'første', errors: [] }))).toBe(true);
        expect(skalVideresende(JSON.stringify({ type: 'sync', hash: 'første', errors: [] }))).toBe(false);
        expect(skalVideresende(JSON.stringify({ type: 'sync', hash: 'ny-kompilering', errors: [] }))).toBe(false);
    });

    it('videresender feil og React-strømmer også etter synkronisering', () => {
        const skalVideresende = lagHmrMeldingsfilter();
        skalVideresende(JSON.stringify({ type: 'sync', hash: 'første', errors: [] }));
        expect(skalVideresende(JSON.stringify({ type: 'sync', hash: 'ny', errors: ['syntetisk feil'] }))).toBe(true);
        expect(skalVideresende(JSON.stringify({ type: 'built', errors: ['syntetisk feil'] }))).toBe(true);
        expect(skalVideresende(Buffer.from([0, 1, 2]))).toBe(true);
        expect(skalVideresende(JSON.stringify({ type: 'serverError' }))).toBe(true);
        expect(skalVideresende(JSON.stringify({ type: 'ukjent-melding' }))).toBe(true);
    });

    it('deler ikke synkroniseringstilstand mellom forbindelser', () => {
        const første = lagHmrMeldingsfilter();
        const andre = lagHmrMeldingsfilter();
        const sync = JSON.stringify({ type: 'sync', errors: [] });
        expect(første(sync)).toBe(true);
        expect(første(sync)).toBe(false);
        expect(andre(sync)).toBe(true);
    });
});
