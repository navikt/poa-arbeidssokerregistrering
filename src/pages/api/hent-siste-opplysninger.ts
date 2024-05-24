import { NextApiHandler } from 'next';
import { getAiaBackendToken, getHeaders } from '../../lib/next-api-handler';
import { nanoid } from 'nanoid';
import { logger } from '@navikt/next-logger';
import {
    hentSisteArbeidssokerPeriode,
    hentSisteOpplysningerOmArbeidssoker,
} from '@navikt/arbeidssokerregisteret-utils';
import { withAuthenticatedApi } from '../../auth/withAuthentication';

const brukerMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === 'enabled';
const PERIODER_URL = `${process.env.AIA_BACKEND_URL}/arbeidssokerregisteret/v1/arbeidssoekerperioder`;
const OPPLYSNINGER_URL = `${process.env.AIA_BACKEND_URL}/arbeidssokerregisteret/v1/opplysninger-om-arbeidssoeker`;

const fetcher = async (url: string, token: string) => {
    const callId = nanoid();
    return fetch(url, {
        headers: getHeaders(token, callId),
    }).then((response) => {
        if (!response.ok) {
            logger.warn(`Respons fra ${url} ikke ok (${response.status}), callId - ${callId}`);
            throw new Error(response.statusText);
        }
        return response.json();
    });
};

const hentSisteOpplysningerHandler: NextApiHandler = async (req, res) => {
    try {
        const aiaBackendToken = brukerMock ? 'token' : await getAiaBackendToken(req);
        const periode = hentSisteArbeidssokerPeriode(await fetcher(PERIODER_URL, aiaBackendToken));

        if (!periode?.periodeId) {
            return res.status(204).end();
        }

        const opplysninger = hentSisteOpplysningerOmArbeidssoker(
            await fetcher(`${OPPLYSNINGER_URL}/${periode.periodeId}`, aiaBackendToken),
        );

        return res.json({
            periode,
            opplysninger,
        });
    } catch (err) {
        logger.error(`Feil i /api/hent-siste-opplysninger`, err);
        res.status(500).end();
    }
};

export default withAuthenticatedApi(hentSisteOpplysningerHandler);
