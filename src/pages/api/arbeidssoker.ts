import lagApiHandlerMedAuthHeaders from '../../lib/next-api-handler';
import { withAuthenticatedApi } from '../../auth/withAuthentication';

const arbeidssokerUrl = `${process.env.ARBEIDSSOKER_PERIODER_URL}?fraOgMed=2020-01-01`;

const arbeidssokerHandler = lagApiHandlerMedAuthHeaders(arbeidssokerUrl);

export default withAuthenticatedApi(arbeidssokerHandler);
