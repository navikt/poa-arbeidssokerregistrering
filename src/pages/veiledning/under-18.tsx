import { useCallback, useState, useEffect } from 'react';
import { Loader } from '@navikt/ds-react';
import { preload } from 'swr';

import { useConfig } from '../../contexts/config-context';

import { loggAktivitet } from '../../lib/amplitude';
import { Config } from '../../model/config';

import {
    KvitteringOppgaveIkkeOpprettet,
    KvitteringOppgaveOpprettet,
    Opprettelsesfeil,
} from '../../components/KvitteringOppgaveUnder18';
import { fetcher, fetcher as api } from '../../lib/api-utils';
import { withAuthenticatedPage } from '../../auth/withAuthentication';

function Under18() {
    const [responseMottatt, settResponseMottatt] = useState<boolean>(false);
    const [oppretterOppgave, settOppretterOppgave] = useState<boolean>(false);
    const [feil, settFeil] = useState<Opprettelsesfeil | undefined>();
    const { enableMock } = useConfig() as Config;
    preload('api/kontaktinformasjon/', fetcher);

    const opprettOppgave = useCallback(async (brukerMock: boolean) => {
        const oppgaveUrl = brukerMock ? 'api/mocks/oppgave-under-18' : 'api/oppgave-under-18';
        loggAktivitet({ aktivitet: 'Oppretter kontakt meg oppgave - under 18' });
        const beskrivelse = `Personen har forsøkt å registrere seg som arbeidssøker, men er sperret fra å gjøre dette da personen er under 18 år.
For mindreårige arbeidssøkere trengs det samtykke fra begge foresatte for å kunne registrere seg.
Se "Servicerutine for innhenting av samtykke fra foresatte for unge under 18 år ved registrering som arbeidssøker".
        
Når samtykke er innhentet kan du registrere arbeidssøker via flate for manuell registrering i modia.`;

        try {
            await api(oppgaveUrl, {
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
        if (!oppretterOppgave && typeof enableMock !== 'undefined') {
            settOppretterOppgave(true);
            opprettOppgave(enableMock === 'enabled');
        }
    }, [oppretterOppgave, enableMock]);

    if (responseMottatt) {
        return feil ? <KvitteringOppgaveIkkeOpprettet feil={feil} /> : <KvitteringOppgaveOpprettet />;
    } else
        return (
            <div>
                <Loader size="xlarge" />
            </div>
        );
}

export const getServerSideProps = withAuthenticatedPage();
export default Under18;
