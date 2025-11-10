import { headers } from 'next/headers';
import { requestTokenxOboToken } from '@navikt/oasis';
import { getHeaders, OPPSLAG_CLIENT_ID, OPPSLAG_V2_CLIENT_ID } from '@/lib/next-api-handler';
import { logger } from '@navikt/next-logger';
import { stripBearer } from '@navikt/oasis/dist/strip-bearer';
import {
    ArbeidssokerPeriode,
    hentSisteArbeidssokerPeriode,
    hentSisteOpplysningerOmArbeidssoker,
    OpplysningerOmArbeidssoker,
} from '@navikt/arbeidssokerregisteret-utils';
import { nanoid } from 'nanoid';
import { mockApiResponse } from '@/app/oppdater-opplysninger/mock-data';
import { brukerMock } from '@/config/env';

const PERIODER_URL = `${process.env.ARBEIDSSOKERREGISTERET_OPPSLAG_API_V2_URL}/api/v1/arbeidssoekerperioder`;
const OPPLYSNINGER_URL = `${process.env.ARBEIDSSOKERREGISTERET_OPPSLAG_API_V2_URL}/api/v1/opplysninger-om-arbeidssoeker`;

async function getTokenXToken(idPortenToken: string) {
    const oboToken = await requestTokenxOboToken(idPortenToken, OPPSLAG_V2_CLIENT_ID);

    if (!oboToken.ok) {
        logger.warn(oboToken.error);
        throw oboToken.error;
    }

    return oboToken.token;
}

const fetcher = async (url: string, token: string, callId: string) => {
    logger.info(`Starter kall mot ${url}, callId - ${callId}`);
    return fetch(url, {
        headers: getHeaders(token, callId),
    }).then((response) => {
        if (!response.ok) {
            logger.error(`Respons fra ${url} ikke ok (${response.status}), callId - ${callId}`);
            throw new Error(response.statusText);
        }
        logger.info(`Kall mot ${url}, callId - ${callId}, ferdig`);
        return response.json();
    });
};

export async function fetchSisteOpplysninger(): Promise<{
    data?: null | { periode: ArbeidssokerPeriode; opplysninger: OpplysningerOmArbeidssoker };
    error?: Error;
}> {
    if (brukerMock) {
        return Promise.resolve({ data: mockApiResponse as any });
        // return new Promise((resolve) => {
        //     setTimeout(() => resolve({ data: mockApiResponse as any }),
        //         3000,
        //     );
        // });
    }
    const callId = nanoid();
    try {
        logger.info(`Starter kall i /oppdater-opplysninger - callId=${callId}`);
        const reqHeaders = await headers();
        const tokenXToken = await getTokenXToken(stripBearer(reqHeaders.get('authorization')!));
        const periode = hentSisteArbeidssokerPeriode(await fetcher(PERIODER_URL, tokenXToken, callId));

        if (!periode?.periodeId) {
            return { data: null };
        }

        const opplysninger = hentSisteOpplysningerOmArbeidssoker(
            await fetcher(`${OPPLYSNINGER_URL}/${periode.periodeId}`, tokenXToken, callId),
        );
        logger.info(`Ferdig kall i /oppdater-opplysninger - callId=${callId}`);
        return {
            data: {
                periode,
                opplysninger,
            },
        };
    } catch (err: any) {
        logger.error({ err, msg: `Feil i /oppdater-opplysninger - callId=${callId}` });
        return { error: err };
    }
}
