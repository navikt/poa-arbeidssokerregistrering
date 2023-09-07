import { NextApiRequest, NextApiResponse } from 'next';

const arbeidssoker = (req: NextApiRequest, res: NextApiResponse) => {
    res.status(200).json({
        arbeidssokerperioder: [{ fraOgMed: '2023-09-07' }],
    });
};

export default arbeidssoker;
