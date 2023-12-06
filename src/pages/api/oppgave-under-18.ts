import { AIA_BACKEND_CLIENT_ID, lagApiPostHandlerMedAuthHeaders } from '../../lib/next-api-handler';
import { withAuthenticatedApi } from '../../auth/withAuthentication';

const opprettOppgaveUrl = `${process.env.OPPRETT_OPPGAVE_URL}/under-18`;
const opprettOppgaveHandler = lagApiPostHandlerMedAuthHeaders(opprettOppgaveUrl, undefined, AIA_BACKEND_CLIENT_ID);

export default withAuthenticatedApi(opprettOppgaveHandler);
