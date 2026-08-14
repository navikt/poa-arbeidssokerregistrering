import type { Meta, StoryObj } from '@storybook/nextjs';
import { KvitteringOppgaveIkkeOpprettet, KvitteringOppgaveOpprettet } from './KvitteringOppgaveUnder18';

const meta: Meta = {
    title: 'Veiledning/Under 18',
    tags: ['autodocs'],
    parameters: {
        nextjs: {
            appDirectory: true,
        },
    },
};

export default meta;
type Story = StoryObj;

/** Veileder vil kontakte brukeren — oppgave ble opprettet */
export const OppgaveOpprettet: Story = {
    name: 'Oppgave opprettet',
    render: () => <KvitteringOppgaveOpprettet />,
};

/** Bruker har allerede bedt om kontakt — vises med info-alert */
export const AlleredeBedtOmKontakt: Story = {
    name: 'Allerede bedt om kontakt',
    render: () => <KvitteringOppgaveIkkeOpprettet feil="finnesAllerede" />,
};

/** Teknisk feil — klarte ikke opprette oppgave */
export const OppgaveFeilet: Story = {
    name: 'Klarte ikke opprette oppgave',
    render: () => <KvitteringOppgaveIkkeOpprettet feil="opprettelseFeilet" />,
};
