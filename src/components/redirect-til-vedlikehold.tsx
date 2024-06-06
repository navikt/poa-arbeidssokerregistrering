import { useRouter } from 'next/router';

import { useFeatureToggles } from '../contexts/featuretoggle-context';

function RedirectTilVedlikehold() {
    const router = useRouter();
    const { toggles } = useFeatureToggles();
    const erVedlikehold = toggles['arbeidssoekerregistrering.vedlikehold'];

    if (erVedlikehold) {
        router.push('/vedlikehold');
    }
    return null;
}

export default RedirectTilVedlikehold;
