import type { NextApiRequest, NextApiResponse } from 'next';

const startRegistrering = (req: NextApiRequest, res: NextApiResponse): void => {
    res.status(200).json({
        underOppfolging: false,
        jobbetSeksAvTolvSisteManeder: false,
        registreringType: 'ORDINAER_REGISTRERING',
        servicegruppe: 'IVURD',
        formidlingsgruppe: 'IARBS',
        geografiskTilknytning: '0807',
        rettighetsgruppe: 'IYT',
        alder: 43,
    });
};

export default startRegistrering;
