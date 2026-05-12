import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import { JaEllerNei } from '@navikt/arbeidssokerregisteret-utils';
import Hindringer from './hindringer';
import Helseproblemer from './helseproblemer';
import AndreProblemer from './andre-problemer';

const meta: Meta<typeof Hindringer> = {
    title: 'Skjema/4 - Hindringer',
    component: Hindringer,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Hindringer>;

const lagBarn = (helseHinder?: JaEllerNei, andreForhold?: JaEllerNei, visFeilmelding = false) => ({
    children: (
        <>
            <div className="my-8">
                <Helseproblemer onChange={fn()} valgt={helseHinder} visFeilmelding={visFeilmelding && !helseHinder} />
            </div>
            <AndreProblemer
                onChange={fn()}
                valgt={andreForhold}
                skjematype="standard"
                visFeilmelding={visFeilmelding && !andreForhold}
            />
        </>
    ),
});

export const Standard: Story = {
    args: lagBarn(),
};

export const MedFeilmelding: Story = {
    args: lagBarn(undefined, undefined, true),
};

export const HelseproblemBesvart: Story = {
    args: lagBarn(JaEllerNei.JA),
};

export const BeggeBesvart: Story = {
    args: lagBarn(JaEllerNei.NEI, JaEllerNei.JA),
};

export const Nynorsk: Story = {
    args: lagBarn(),
    globals: { sprak: 'nn' },
};

export const English: Story = {
    args: lagBarn(),
    globals: { sprak: 'en' },
};
