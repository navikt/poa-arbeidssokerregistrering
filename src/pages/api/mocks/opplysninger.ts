import type { NextApiRequest, NextApiResponse } from 'next';

const opplysninger = (req: NextApiRequest, res: NextApiResponse): void => {
    res.status(200).json({});
};

export default opplysninger;
