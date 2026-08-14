import type { Meta, StoryObj } from '@storybook/nextjs';
import NotFound from './not-found';

const meta: Meta<typeof NotFound> = {
    title: 'Feilsider/404 - Ikke funnet',
    component: NotFound,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NotFound>;

/** Siden brukeren forsøkte å nå finnes ikke */
export const Standard: Story = {};
