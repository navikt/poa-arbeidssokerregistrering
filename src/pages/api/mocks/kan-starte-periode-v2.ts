import type { NextApiRequest, NextApiResponse } from 'next';

const kanStartePeriode = (req: NextApiRequest, res: NextApiResponse): void => {
    res.status(200).json(periodeData);
};

const periodeData = {
    melding: 'Er under 18 år',
    feilKode: 'AVVIST',
    aarasakTilAvvisning: {
        regler: [
            {
                id: 'ER_UNDER_18_AAR',
                beskrivelse: 'Er under 18 år',
            },
        ],
        detaljer: ['ER_UNDER_18_AAR'],
    },
    status: 403,
};

export default kanStartePeriode;
