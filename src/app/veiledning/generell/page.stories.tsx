import type { Meta, StoryObj } from '@storybook/nextjs';
import { GenerellVeiledningInnhold } from './innhold';

const meta: Meta<typeof GenerellVeiledningInnhold> = {
    title: 'Veiledning/Generell stoppsituasjon',
    component: GenerellVeiledningInnhold,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GenerellVeiledningInnhold>;

/** Bruker må registreres av veileder — generell stoppsituasjon (bokmål) */
export const Bokmal: Story = {
    args: { sprak: 'nb' },
};

/** Nynorsk-variant */
export const Nynorsk: Story = {
    args: { sprak: 'nn' },
};

/** Engelsk variant */
export const Engelsk: Story = {
    args: { sprak: 'en' },
};
