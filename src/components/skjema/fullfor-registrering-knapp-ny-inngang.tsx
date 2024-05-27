import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useConfig } from '../../contexts/config-context';
import { Config } from '../../model/config';
import byggOpplysningerPayload from '../../lib/bygg-opplysninger-payload';
import { fetcher as api } from '../../lib/api-utils';
import hentKvitteringsUrl from '../../lib/hent-kvitterings-url';
import { logger } from '@navikt/next-logger';
import { FeilmeldingGenerell } from '../feilmeldinger/feilmeldinger';
import { Button } from '@navikt/ds-react';
import { SkjemaState } from '../../model/skjema';

interface FullforKnappProps {
    skjemaState: SkjemaState;
    onSubmit(): void;
    onValiderSkjema(): boolean;
    tekst(s: string): string;
    startNyPeriode: boolean;
}

const FullforRegistreringKnappNyInngang = (props: FullforKnappProps) => {
    const { tekst, startNyPeriode } = props;
    const [senderSkjema, settSenderSkjema] = useState<boolean>(false);
    const [visFeilmelding, settVisFeilmelding] = useState<boolean>(false);
    const router = useRouter();
    const { enableMock } = useConfig() as Config;
    const brukerMock = enableMock === 'enabled';
    const { skjemaState, onSubmit, onValiderSkjema } = props;
    const fullfoerRegistreringUrl = brukerMock ? 'api/mocks/opplysninger' : 'api/opplysninger';
    const startArbeidssokerPeriodeUrl = brukerMock
        ? 'api/mocks/start-arbeidssokerperiode'
        : 'api/start-arbeidssokerperiode';

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

            if (startNyPeriode) {
                await api(startArbeidssokerPeriodeUrl, {
                    method: 'PUT',
                    body: null,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            }

            await api(fullfoerRegistreringUrl, {
                method: 'post',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            return router.push(hentKvitteringsUrl());
        } catch (e) {
            settVisFeilmelding(true);
            logger.error(e, `Registreringfeilet`);
            console.error(e);
            return router.push('/feil/');
        } finally {
            settSenderSkjema(false);
        }
    }, [onSubmit, router, skjemaState, fullfoerRegistreringUrl]);

    return (
        <>
            {visFeilmelding && (
                <div className="mb-6">
                    <FeilmeldingGenerell />
                </div>
            )}
            <div style={{ textAlign: 'center' }}>
                <Button onClick={validerOgFullfor} loading={senderSkjema} disabled={senderSkjema}>
                    {tekst('fullfoerRegistrering')}
                </Button>
            </div>
        </>
    );
};

export default FullforRegistreringKnappNyInngang;
