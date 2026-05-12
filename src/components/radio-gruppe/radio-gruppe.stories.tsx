import type { Meta, StoryObj } from '@storybook/nextjs';
import RadioGruppe from './radio-gruppe';

const meta: Meta<typeof RadioGruppe> = {
    title: 'Komponenter/RadioGruppe',
    component: RadioGruppe,
    tags: ['autodocs'],
    args: {
        legend: 'Velg et alternativ',
        valg: [
            { tekst: 'Alternativ A', value: 'A' },
            { tekst: 'Alternativ B', value: 'B' },
            { tekst: 'Alternativ C', value: 'C' },
        ],
        visFeilmelding: false,
    },
};

export default meta;
type Story = StoryObj<typeof RadioGruppe>;

export const Standard: Story = {};

export const MedFeilmelding: Story = {
    args: { visFeilmelding: true },
};

export const MedBeskrivelse: Story = {
    args: {
        beskrivelse: 'Velg det alternativet som passer best for deg.',
    },
};

export const MedValgtAlternativ: Story = {
    args: { valgt: 'B' },
};

export const Nynorsk: Story = {
    args: { visFeilmelding: true },
    globals: { sprak: 'nn' },
};

export const English: Story = {
    args: { visFeilmelding: true },
    globals: { sprak: 'en' },
};
