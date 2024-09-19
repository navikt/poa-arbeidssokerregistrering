import type { NextApiRequest, NextApiResponse } from 'next';
import lagApiHandlerMedAuthHeaders from '../../lib/next-api-handler';
import { withAuthenticatedApi } from '../../auth/withAuthentication';

async function kryssklassifiser(req: NextApiRequest, res: NextApiResponse<string>) {
    const styrkKode = req.query.styrkKode;
    const url = `${process.env.PAM_ONTOLOGI_URL}/ontologi/styrk98/konverter/${styrkKode}`;
    const handler = lagApiHandlerMedAuthHeaders(url);
    return handler(req, res);
}

export default withAuthenticatedApi(kryssklassifiser);
