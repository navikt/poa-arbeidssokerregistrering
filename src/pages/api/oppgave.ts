import { lagApiPostHandlerMedAuthHeaders } from '../../lib/next-api-handler';
import { withAuthenticatedApi } from '../../auth/withAuthentication';

const opprettOppgaveUrl = `${process.env.OPPRETT_OPPGAVE_URL}`;
const opprettOppgaveHandler = lagApiPostHandlerMedAuthHeaders(opprettOppgaveUrl);

export default withAuthenticatedApi(opprettOppgaveHandler);
