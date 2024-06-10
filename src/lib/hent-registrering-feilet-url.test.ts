import { hentRegistreringFeiletUrl } from './hent-registrering-feilet-url';
import { ErrorTypes } from '../model/error';
import { OppgaveRegistreringstype } from '../model/feilsituasjonTyper';

describe('hent-registrering-feilet-url', () => {
    it('returnerer "/veiledning/registrering/utvandret/" for død, utvandret eller forsvunnet bruker', () => {
        expect(
            hentRegistreringFeiletUrl(
                ErrorTypes.BRUKER_ER_DOD_UTVANDRET_ELLER_FORSVUNNET,
                OppgaveRegistreringstype.REGISTRERING,
            ),
        ).toBe('/veiledning/registrering/utvandret/');
    });

    it('returnerer "/veiledning/registrering/mangler-arbeidstillatelse/" for bruker som mangler arbeidstillatelse', () => {
        expect(
            hentRegistreringFeiletUrl(
                ErrorTypes.BRUKER_MANGLER_ARBEIDSTILLATELSE,
                OppgaveRegistreringstype.REGISTRERING,
            ),
        ).toBe('/veiledning/registrering/mangler-arbeidstillatelse/');
    });

    it('returnerer "/feil/" for ukjent bruker', () => {
        expect(hentRegistreringFeiletUrl(ErrorTypes.BRUKER_ER_UKJENT, OppgaveRegistreringstype.REGISTRERING)).toBe(
            '/feil/',
        );
    });
});
