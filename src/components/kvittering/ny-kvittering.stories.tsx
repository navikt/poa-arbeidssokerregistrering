import type { Meta, StoryObj } from '@storybook/nextjs';
import { HttpResponse, http } from 'msw';
import { ConfigProvider } from '../../contexts/config-context';
import { FortsettTilDagpenger, StandardKvittering } from './ny-kvittering';

const mockConfigHandler = http.get('/arbeid/registrering/api/config/', () =>
    HttpResponse.json({
        dittNavUrl: 'https://www.nav.no/minside',
        arbeidssoekerregisteretUrl: 'https://arbeid.nav.no',
        dagpengesoknadUrl: 'https://www.nav.no/dagpenger/dialog/soknad',
        brukerdialogDagpengerUrl: 'https://www.nav.no/dagpenger/dialog/fortsett-soknad',
        enableMock: 'enabled',
    }),
);

const meta: Meta = {
    title: 'Kvittering',
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <ConfigProvider>
                <Story />
            </ConfigProvider>
        ),
    ],
    parameters: {
        nextjs: {
            appDirectory: true,
        },
        msw: {
            handlers: [mockConfigHandler],
        },
    },
};

export default meta;
type Story = StoryObj;

/** Standard kvittering etter vellykket registrering som arbeidssøker */
export const Standard: Story = {
    name: 'Standard kvittering',
    render: () => <StandardKvittering />,
};

/** Kvittering for bruker som startet registreringen fra dagpengesøknaden */
export const FortsettDagpenger: Story = {
    name: 'Fortsett til dagpenger',
    render: () => <FortsettTilDagpenger />,
};
