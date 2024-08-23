import { withAuthenticatedApi } from '../../auth/withAuthentication';
import lagArbeidssokerApiKall from '../../lib/lag-arbeidssoker-api-kall';

const url = `${process.env.INNGANG_API_URL}/api/v2/arbeidssoker/kanStartePeriode`;

export default withAuthenticatedApi(lagArbeidssokerApiKall(url, { method: 'PUT' }));
