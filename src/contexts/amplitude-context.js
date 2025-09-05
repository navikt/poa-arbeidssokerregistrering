import { createContext, useContext, useEffect } from 'react';
import { initTracker, trackEvent } from '../lib/tracker';
import { useConfig } from './config-context';

const AmplitudeContext = createContext();

function AmplitudeProvider({ children }) {
    const { amplitudeApiKey: apiKey, amplitudeEndPoint: apiEndpoint } = useConfig();

    useEffect(() => {
        if (apiKey && apiEndpoint) {
            initTracker({ apiKey, apiEndpoint });
        }
    }, [apiKey, apiEndpoint]);

    return <AmplitudeContext.Provider value={{ logAmplitudeEvent: trackEvent }}>{children}</AmplitudeContext.Provider>;
}

function useAmplitude() {
    const context = useContext(AmplitudeContext);
    if (context === undefined) {
        throw new Error('useAmplitude må brukes under en AmplitudeProvider');
    }
    return context;
}

export { AmplitudeProvider, useAmplitude };
