import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import { JaEllerNei, UtdanningGodkjentValg, Utdanningsnivaa } from '@navikt/arbeidssokerregisteret-utils';
import Utdanning from './utdanning';
import UtdanningGodkjent from './utdanning-godkjent';
import BestattUtdanning from './utdanning-bestatt';

const meta: Meta<typeof Utdanning> = {
    title: 'Skjema/3 - Utdanning',
    component: Utdanning,
    tags: ['autodocs'],
    args: {
        onChange: fn(),
        visFeilmelding: false,
    },
};

export default meta;
type Story = StoryObj<typeof Utdanning>;

export const Standard: Story = {};

export const MedValgtUtdanning: Story = {
    args: { valgt: Utdanningsnivaa.HOYERE_UTDANNING_1_TIL_4 },
};

export const MedFeilmelding: Story = {
    args: { visFeilmelding: true },
};

/** Viser underspørsmål om godkjenning og bestått (for utdanningsnivåer som krever det) */
export const MedUndersporsmal: Story = {
    args: {
        valgt: Utdanningsnivaa.HOYERE_UTDANNING_1_TIL_4,
        children: (
            <>
                <div className="my-8">
                    <UtdanningGodkjent
                        onChange={fn()}
                        valgt={UtdanningGodkjentValg.JA}
                        visFeilmelding={false}
                        visKomponent={true}
                    />
                </div>
                <BestattUtdanning onChange={fn()} valgt={JaEllerNei.JA} visFeilmelding={false} visKomponent={true} />
            </>
        ),
    },
};

export const Nynorsk: Story = {
    globals: { sprak: 'nn' },
};

export const English: Story = {
    globals: { sprak: 'en' },
};
