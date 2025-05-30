'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@navikt/ds-react';
import { PaperplaneIcon } from '@navikt/aksel-icons';
import { logger } from '@navikt/next-logger';

import { useConfig } from '@/contexts/config-context';

import { Config } from '@/model/config';
import byggOpplysningerPayload from '../../lib/bygg-opplysninger-payload';
import { fetcher as api } from '../../lib/api-utils';
import hentKvitteringsUrl from '../../lib/hent-kvitterings-url';
import { FeilmeldingGenerell } from '../feilmeldinger/feilmeldinger';
import { SkjemaState } from '@/model/skjema';
import { loggAktivitet, loggFlyt } from '@/lib/amplitude';
import useSprak from '@/hooks/useSprak';

interface FullforKnappProps {
    skjemaState: SkjemaState;
    onSubmit(): void;
    onValiderSkjema(): boolean;
    tekst(s: string): string;
}

const beregnTidBrukt = (skjemaState: SkjemaState) => {
    if (!skjemaState.startTid) {
        return;
    }

    return (Date.now() - skjemaState.startTid) / 1000;
};

const FullforRegistreringKnappNyInngang = (props: FullforKnappProps) => {
    const { tekst } = props;
    const [senderSkjema, settSenderSkjema] = useState<boolean>(false);
    const [visFeilmelding, settVisFeilmelding] = useState<boolean>(false);
    const router = useRouter();
    const { enableMock } = useConfig() as Config;
    const sprak = useSprak();

    const startPeriodeVersjon = 'start-arbeidssokerperiode-v2';
    const brukerMock = enableMock === 'enabled';
    const { skjemaState, onSubmit, onValiderSkjema } = props;
    const fullfoerRegistreringUrl = brukerMock ? 'api/mocks/opplysninger' : 'api/opplysninger';
    const startArbeidssokerPeriodeUrl = brukerMock ? `api/mocks/${startPeriodeVersjon}` : `api/${startPeriodeVersjon}`;

    const validerOgFullfor = () => {
        if (onValiderSkjema()) {
            return fullforRegistrering();
        }
    };

    const fullforRegistrering = useCallback(async () => {
        try {
            const body = byggOpplysningerPayload(skjemaState);
            settSenderSkjema(true);
            settVisFeilmelding(false);
            onSubmit();

            await api(startArbeidssokerPeriodeUrl, {
                method: 'PUT',
                body: null,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            await api(fullfoerRegistreringUrl, {
                method: 'post',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            loggAktivitet({
                aktivitet: 'Utfylling av skjema fullført',
                tidBruktForAaFullforeSkjema: beregnTidBrukt(skjemaState),
            });

            loggFlyt({ hendelse: 'Sender inn skjema for registrering' });

            return router.push(hentKvitteringsUrl(sprak));
        } catch (e) {
            settVisFeilmelding(true);
            logger.error(e, `Registreringfeilet`);
            console.error(e);
            return router.push('/feil/');
        } finally {
            settSenderSkjema(false);
        }
    }, [onSubmit, router, skjemaState, fullfoerRegistreringUrl, sprak]);

    return (
        <>
            {visFeilmelding && (
                <div className="mb-6">
                    <FeilmeldingGenerell />
                </div>
            )}
            <div style={{ textAlign: 'left' }}>
                <Button
                    onClick={validerOgFullfor}
                    loading={senderSkjema}
                    disabled={senderSkjema}
                    icon={<PaperplaneIcon />}
                    iconPosition="right"
                >
                    {tekst('fullfoerRegistrering')}
                </Button>
            </div>
        </>
    );
};

export default FullforRegistreringKnappNyInngang;
