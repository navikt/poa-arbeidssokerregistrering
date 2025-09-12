'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConfig } from '@/contexts/config-context';
import { Config } from '@/model/config';
import byggOpplysningerPayload from '../../lib/bygg-opplysninger-payload';
import { fetcher as api } from '../../lib/api-utils';
import { logger } from '@navikt/next-logger';
import { FeilmeldingGenerell } from '../feilmeldinger/feilmeldinger';
import { Button } from '@navikt/ds-react';
import { PaperplaneIcon } from '@navikt/aksel-icons';
import { SkjemaState } from '@/model/skjema';

interface OppdaterOpplysningerKnappProps {
    skjemaState: SkjemaState;
    onSubmit(): void;
    onValiderSkjema(): boolean;
    tekst(s: string): string;
}

const OppdaterOpplysningerKnapp = (props: OppdaterOpplysningerKnappProps) => {
    const { tekst } = props;
    const [senderSkjema, settSenderSkjema] = useState<boolean>(false);
    const [visFeilmelding, settVisFeilmelding] = useState<boolean>(false);
    const router = useRouter();
    const { enableMock, arbeidssoekerregisteretUrl } = useConfig() as Config;
    const brukerMock = enableMock === 'enabled';
    const { skjemaState, onSubmit, onValiderSkjema } = props;
    const oppdaterOpplysningerUrl = brukerMock ? 'api/mocks/opplysninger' : 'api/opplysninger';

    const validerOgFullfor = () => {
        if (onValiderSkjema()) {
            return oppdaterOpplysninger();
        }
    };

    const oppdaterOpplysninger = useCallback(async () => {
        try {
            const body = byggOpplysningerPayload(skjemaState);
            settSenderSkjema(true);
            settVisFeilmelding(false);
            onSubmit();

            await api(oppdaterOpplysningerUrl, {
                method: 'post',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            document.location.href = arbeidssoekerregisteretUrl;
            return;
        } catch (e) {
            settVisFeilmelding(true);
            logger.error(e, `Oppdatering av opplysninger feilet`);
            console.error(e);
            return router.push('/feil/');
        } finally {
            settSenderSkjema(false);
        }
    }, [skjemaState, onSubmit, oppdaterOpplysningerUrl, arbeidssoekerregisteretUrl, router]);

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

export default OppdaterOpplysningerKnapp;
