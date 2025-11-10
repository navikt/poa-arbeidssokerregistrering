import { brukerMock } from '@/config/env';
import { arbeidssokerApiKall } from '@/lib/arbeidssoker-api-kall';

const url = `${process.env.INNGANG_API_URL}/api/v2/arbeidssoker/kanStartePeriode`;

export async function fetchKanStartePeriode(): Promise<{ data?: any; error?: any }> {
    if (brukerMock) {
        return Promise.resolve({
            data: {
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
            },
        });
    }

    return arbeidssokerApiKall(url);
}
