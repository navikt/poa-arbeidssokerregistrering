import type { Meta, StoryObj } from '@storybook/nextjs';
import { HttpResponse, http } from 'msw';
import { fn } from 'storybook/test';
import SisteJobbSkjema from './siste-jobb';

const stillingMock = {
    label: 'Sykepleier',
    konseptId: 628,
    styrk08: '2221',
};

const handlers = {
    medArbeidsforhold: [
        http.get('/arbeid/registrering/api/sistearbeidsforhold-fra-aareg-v2/', () => {
            return HttpResponse.json(stillingMock);
        }),
    ],
    utenArbeidsforhold: [
        http.get('/arbeid/registrering/api/sistearbeidsforhold-fra-aareg-v2/', () => {
            return new HttpResponse(null, { status: 204 });
        }),
    ],
    feil: [
        http.get('/arbeid/registrering/api/sistearbeidsforhold-fra-aareg-v2/', () => {
            return new HttpResponse(null, { status: 500 });
        }),
    ],
};

const meta: Meta<typeof SisteJobbSkjema> = {
    title: 'Skjema/2 - Siste jobb',
    component: SisteJobbSkjema,
    tags: ['autodocs'],
    args: {
        onChange: fn(),
        visFeilmelding: false,
        visSisteJobb: true,
    },
};

export default meta;
type Story = StoryObj<typeof SisteJobbSkjema>;

/** Viser stilling hentet fra Aa-registeret */
export const MedRegistrertStilling: Story = {
    parameters: {
        msw: { handlers: handlers.medArbeidsforhold },
    },
};

/** Ingen stilling funnet i Aa-registeret — viser søkefelt direkte */
export const UtenRegistrertStilling: Story = {
    parameters: {
        msw: { handlers: handlers.utenArbeidsforhold },
    },
};

/** API-feil — faller tilbake til "Annen stilling" */
export const ApiFeil: Story = {
    parameters: {
        msw: { handlers: handlers.feil },
    },
};

export const MedForhaandsvalgtStilling: Story = {
    args: {
        valgt: stillingMock,
    },
    parameters: {
        msw: { handlers: handlers.medArbeidsforhold },
    },
};
