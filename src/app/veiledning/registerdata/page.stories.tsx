import type { Meta, StoryObj } from '@storybook/nextjs';
import { RegisteerdataVeiledningInnhold } from './innhold';

const meta: Meta<typeof RegisteerdataVeiledningInnhold> = {
    title: 'Veiledning/Registerdata',
    component: RegisteerdataVeiledningInnhold,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RegisteerdataVeiledningInnhold>;

/** Registerdata fra folkeregisteret oppfyller ikke kravene (bokmål) */
export const Bokmal: Story = {
    args: { sprak: 'nb' },
};
