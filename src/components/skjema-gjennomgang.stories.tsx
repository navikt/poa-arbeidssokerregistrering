import {
    DinSituasjon as DinSituasjonValg,
    JaEllerNei,
    SisteStillingValg,
    UtdanningGodkjentValg,
    Utdanningsnivaa,
} from '@navikt/arbeidssokerregisteret-utils';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { HttpResponse, http } from 'msw';
import { fn } from 'storybook/test';
import type { SkjemaState } from '@/model/skjema';
import AndreProblemer from './skjema/andre-problemer';
import DinSituasjon from './skjema/din-situasjon';
import Helseproblemer from './skjema/helseproblemer';
import Hindringer from './skjema/hindringer';
import Oppsummering from './skjema/oppsummering/oppsummering';
import SisteJobbSkjema from './skjema/siste-jobb/siste-jobb';
import Utdanning from './skjema/utdanning';
import BestattUtdanning from './skjema/utdanning-bestatt';
import UtdanningGodkjent from './skjema/utdanning-godkjent';

/**
 * Gjennomgang av hele registreringsskjemaet — ett steg per story.
 * Hver story representerer tilstanden til skjemaet på et gitt steg.
 */
const meta: Meta = {
    title: 'Skjema/Gjennomgang',
    tags: ['autodocs'],
    parameters: {
        msw: {
            handlers: [
                http.get('/arbeid/registrering/api/sistearbeidsforhold-fra-aareg-v2/', () =>
                    HttpResponse.json({ label: 'Sykepleier', konseptId: 628, styrk08: '2221' }),
                ),
            ],
        },
    },
};

export default meta;

const fullState: SkjemaState = {
    dinSituasjon: DinSituasjonValg.MISTET_JOBBEN,
    sisteStilling: SisteStillingValg.HAR_HATT_JOBB,
    sisteJobb: { label: 'Sykepleier', konseptId: 628, styrk08: '2221' },
    utdanning: Utdanningsnivaa.HOYERE_UTDANNING_1_TIL_4,
    utdanningGodkjent: UtdanningGodkjentValg.JA,
    utdanningBestatt: JaEllerNei.JA,
    helseHinder: JaEllerNei.NEI,
    andreForhold: JaEllerNei.NEI,
    startTid: Date.now(),
    hasInitialized: true,
};

/** Steg 1: Din situasjon */
export const Steg1DinSituasjon: StoryObj = {
    render: () => <DinSituasjon onChange={fn()} valgt={DinSituasjonValg.MISTET_JOBBEN} visFeilmelding={false} />,
};

/** Steg 2: Siste jobb — viser stilling fra Aa-registeret */
export const Steg2SisteJobb: StoryObj = {
    render: () => (
        <SisteJobbSkjema onChange={fn()} valgt={fullState.sisteJobb} visSisteJobb={true} visFeilmelding={false} />
    ),
};

/** Steg 3: Utdanning med underspørsmål om godkjenning og bestått */
export const Steg3Utdanning: StoryObj = {
    render: () => (
        <Utdanning onChange={fn()} valgt={Utdanningsnivaa.HOYERE_UTDANNING_1_TIL_4} visFeilmelding={false}>
            <div className="my-8">
                <UtdanningGodkjent
                    onChange={fn()}
                    valgt={UtdanningGodkjentValg.JA}
                    visFeilmelding={false}
                    visKomponent={true}
                />
            </div>
            <BestattUtdanning onChange={fn()} valgt={JaEllerNei.JA} visFeilmelding={false} visKomponent={true} />
        </Utdanning>
    ),
};

/** Steg 4: Hindringer — helseproblemer og andre problemer */
export const Steg4Hindringer: StoryObj = {
    render: () => (
        <Hindringer>
            <div className="my-8">
                <Helseproblemer onChange={fn()} valgt={JaEllerNei.NEI} visFeilmelding={false} />
            </div>
            <AndreProblemer onChange={fn()} valgt={JaEllerNei.NEI} skjematype="standard" visFeilmelding={false} />
        </Hindringer>
    ),
};

/** Steg 5: Oppsummering med alle svar */
export const Steg5Oppsummering: StoryObj = {
    render: () => <Oppsummering skjemaState={fullState} skjemaPrefix="/opplysninger/" onSubmit={fn()} />,
};
