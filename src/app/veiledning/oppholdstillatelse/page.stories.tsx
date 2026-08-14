import type { Meta, StoryObj } from '@storybook/nextjs';
import { OppholdstillatelseVeiledningInnhold } from './innhold';

const meta: Meta<typeof OppholdstillatelseVeiledningInnhold> = {
    title: 'Veiledning/Oppholdstillatelse',
    component: OppholdstillatelseVeiledningInnhold,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OppholdstillatelseVeiledningInnhold>;

/** Bruker mangler oppholdstillatelse — må registreres av veileder (bokmål) */
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
