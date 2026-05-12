import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import { DinSituasjon as DinSituasjonValg } from '@navikt/arbeidssokerregisteret-utils';
import DinSituasjon from './din-situasjon';

const meta: Meta<typeof DinSituasjon> = {
    title: 'Skjema/1 - Din situasjon',
    component: DinSituasjon,
    tags: ['autodocs'],
    args: {
        onChange: fn(),
        visFeilmelding: false,
    },
};

export default meta;
type Story = StoryObj<typeof DinSituasjon>;

export const Standard: Story = {};

export const MedValgtAlternativ: Story = {
    args: { valgt: DinSituasjonValg.MISTET_JOBBEN },
};

export const MedFeilmelding: Story = {
    args: { visFeilmelding: true },
};

export const Nynorsk: Story = {
    globals: { sprak: 'nn' },
};

export const English: Story = {
    globals: { sprak: 'en' },
};
