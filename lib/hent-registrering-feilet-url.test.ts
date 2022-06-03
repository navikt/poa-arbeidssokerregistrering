import { hentRegistreringFeiletUrl } from './hent-registrering-feilet-url';
import { ErrorTypes } from '../model/error';
import { OppgaveRegistreringstype } from '../model/feilsituasjonTyper';

describe('hent-registrering-feilet-url', () => {
    it('returnerer "/veiledning/registrering/utvandret/" for død, utvandret eller forsvunnet bruker', () => {
        expect(
            hentRegistreringFeiletUrl(
                ErrorTypes.BRUKER_ER_DOD_UTVANDRET_ELLER_FORSVUNNET,
                OppgaveRegistreringstype.REGISTRERING
            )
        ).toBe('/veiledning/registrering/utvandret/');
    });

    it('returnerer "/veiledning/registrering/mangler-arbeidstillatelse/" for bruker som mangler arbeidstillatelse', () => {
        expect(
            hentRegistreringFeiletUrl(
                ErrorTypes.BRUKER_MANGLER_ARBEIDSTILLATELSE,
                OppgaveRegistreringstype.REGISTRERING
            )
        ).toBe('/veiledning/registrering/mangler-arbeidstillatelse/');
    });

    it('returnerer "/veiledning/reaktivering/utvandret/" for død, utvandret eller forsvunnet bruker', () => {
        expect(
            hentRegistreringFeiletUrl(
                ErrorTypes.BRUKER_ER_DOD_UTVANDRET_ELLER_FORSVUNNET,
                OppgaveRegistreringstype.REAKTIVERING
            )
        ).toBe('/veiledning/reaktivering/utvandret/');
    });

    it('returnerer "/veiledning/reaktivering/mangler-arbeidstillatelse/" for bruker som mangler arbeidstillatelse', () => {
        expect(
            hentRegistreringFeiletUrl(
                ErrorTypes.BRUKER_MANGLER_ARBEIDSTILLATELSE,
                OppgaveRegistreringstype.REAKTIVERING
            )
        ).toBe('/veiledning/reaktivering/mangler-arbeidstillatelse/');
    });

    it('returnerer "/veiledning/reaktivering/kan-ikke-reaktiveres-forenklet/" for bruker som ikke kan reaktiveres forenklet', () => {
        expect(
            hentRegistreringFeiletUrl(
                ErrorTypes.BRUKER_KAN_IKKE_REAKTIVERES_FORENKLET,
                OppgaveRegistreringstype.REAKTIVERING
            )
        ).toBe('/veiledning/reaktivering/kan-ikke-reaktiveres-forenklet/');
    });

    it('returnerer "/feil/" for ukjent bruker', () => {
        expect(hentRegistreringFeiletUrl(ErrorTypes.BRUKER_ER_UKJENT, OppgaveRegistreringstype.REGISTRERING)).toBe(
            '/feil/'
        );
    });

    it('returnerer "/feil/" for bruker som ikke kan reaktiveres', () => {
        expect(
            hentRegistreringFeiletUrl(ErrorTypes.BRUKER_KAN_IKKE_REAKTIVERES, OppgaveRegistreringstype.REAKTIVERING)
        ).toBe('/feil/');
    });
});
