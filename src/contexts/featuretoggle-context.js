import { createContext, useContext } from 'react';
import useSWR from 'swr';

import { fetcher } from '../lib/api-utils';

const FeatureToggleContext = createContext();

function tilAktiveFeatures(data = []) {
    return data.reduce((features, feature) => {
        if (feature.enabled) {
            features[feature.name] = true;
        }
        return features;
    }, {});
}
function FeatureToggleProvider({ children }) {
    const { data } = useSWR('api/features', fetcher);
    const toggles = tilAktiveFeatures(data);
    return <FeatureToggleContext.Provider value={{ toggles }}>{children}</FeatureToggleContext.Provider>;
}

function useFeatureToggles() {
    const context = useContext(FeatureToggleContext);
    if (context === undefined) {
        throw new Error('useFeatureToggles må brukes under en FeatureToggleProvider');
    }
    return context;
}

export { FeatureToggleProvider, useFeatureToggles, tilAktiveFeatures };
