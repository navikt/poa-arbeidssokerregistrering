import { withAuthenticatedApi } from '../../auth/withAuthentication';
import lagArbeidssokerApiKall from '../../lib/lag-arbeidssoker-api-kall';

const url = `${process.env.INNGANG_API_URL}/api/v1/arbeidssoker/kanStartePeriode`;

export default withAuthenticatedApi(lagArbeidssokerApiKall(url, { method: 'PUT' }));
