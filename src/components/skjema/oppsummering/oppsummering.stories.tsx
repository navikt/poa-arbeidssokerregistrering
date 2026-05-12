import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import {
    DinSituasjon,
    JaEllerNei,
    SisteStillingValg,
    Utdanningsnivaa,
    UtdanningGodkjentValg,
} from '@navikt/arbeidssokerregisteret-utils';
import Oppsummering from './oppsummering';
import type { SkjemaState } from '@/model/skjema';

const fullState: SkjemaState = {
    dinSituasjon: DinSituasjon.MISTET_JOBBEN,
    sisteStilling: SisteStillingValg.HAR_HATT_JOBB,
    sisteJobb: { label: 'Sykepleier', konseptId: 628, styrk08: '2221' },
    utdanning: Utdanningsnivaa.HOYERE_UTDANNING_1_TIL_4,
    utdanningGodkjent: UtdanningGodkjentValg.JA,
    utdanningBestatt: JaEllerNei.JA,
    helseHinder: JaEllerNei.NEI,
    andreForhold: JaEllerNei.NEI,
    startTid: Date.now(),
    hasInitialized: true,
};

const delvisState: SkjemaState = {
    dinSituasjon: DinSituasjon.ALDRI_HATT_JOBB,
    utdanning: Utdanningsnivaa.GRUNNSKOLE,
    helseHinder: JaEllerNei.NEI,
    andreForhold: JaEllerNei.NEI,
    startTid: Date.now(),
    hasInitialized: true,
};

const meta: Meta<typeof Oppsummering> = {
    title: 'Skjema/5 - Oppsummering',
    component: Oppsummering,
    tags: ['autodocs'],
    args: {
        onSubmit: fn(),
        skjemaPrefix: '/opplysninger/',
    },
};

export default meta;
type Story = StoryObj<typeof Oppsummering>;

/** Alle spørsmål besvart */
export const FulltUtfylt: Story = {
    args: { skjemaState: fullState },
};

/** Kun svar som er relevante for "aldri hatt jobb"-situasjon */
export const DelvisUtfylt: Story = {
    args: { skjemaState: delvisState },
};

export const Nynorsk: Story = {
    args: { skjemaState: fullState },
    globals: { sprak: 'nn' },
};

export const English: Story = {
    args: { skjemaState: fullState },
    globals: { sprak: 'en' },
};
