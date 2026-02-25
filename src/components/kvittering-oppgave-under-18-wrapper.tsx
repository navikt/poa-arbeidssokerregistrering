'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    KvitteringOppgaveIkkeOpprettet,
    KvitteringOppgaveOpprettet,
    Opprettelsesfeil,
} from './KvitteringOppgaveUnder18';
import { Loader } from '@navikt/ds-react';
import { loggAktivitet } from '@/lib/tracker';
import { fetcher as api } from '@/lib/api-utils';

export default async function KvitteringUnder18Wrapper() {
    const [responseMottatt, settResponseMottatt] = useState<boolean>(false);
    const [oppretterOppgave, settOppretterOppgave] = useState<boolean>(false);
    const [feil, settFeil] = useState<Opprettelsesfeil | undefined>();

    const opprettOppgave = useCallback(async () => {
        loggAktivitet({ aktivitet: 'Oppretter kontakt meg oppgave - under 18' });
        const beskrivelse = `Personen har forsøkt å registrere seg som arbeidssøker, men er sperret fra å gjøre dette da personen er under 18 år.
For mindreårige arbeidssøkere trengs det samtykke fra begge foresatte for å kunne registrere seg.
Se "Samtykke fra foresatte til unge under 18 år - registrering som arbeidssøker, øvrige tiltak og tjenester".

Når samtykke er innhentet kan du registrere arbeidssøker via flate for manuell registrering i modia.`;

        try {
            await api('api/oppgave-under-18', {
                method: 'post',
                body: JSON.stringify({ beskrivelse }),
                onError: (res) => {
                    if (res.status === 403) {
                        settFeil('finnesAllerede');
                    } else {
                        throw Error(res.statusText);
                    }
                },
            });
        } catch (e) {
            settFeil('opprettelseFeilet');
        }
        settResponseMottatt(true);
    }, []);

    useEffect(() => {
        if (!oppretterOppgave) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            settOppretterOppgave(true);
            opprettOppgave();
        }
    }, [oppretterOppgave, opprettOppgave]);

    if (responseMottatt) {
        return feil ? <KvitteringOppgaveIkkeOpprettet feil={feil} /> : <KvitteringOppgaveOpprettet />;
    } else
        return (
            <div>
                <Loader size="xlarge" />
            </div>
        );
}
