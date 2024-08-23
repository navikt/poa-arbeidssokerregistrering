import type { NextApiRequest, NextApiResponse } from 'next';

const startArbeidssokerperiode = (req: NextApiRequest, res: NextApiResponse): void => {
    res.status(204).end();
};

export default startArbeidssokerperiode;
