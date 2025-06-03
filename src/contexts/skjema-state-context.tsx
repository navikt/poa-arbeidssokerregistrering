'use client';

import { createContext, Dispatch, useContext, useReducer } from 'react';
import { SkjemaAction, skjemaReducer } from '@/lib/skjema-state';
import { SkjemaState } from '@/model/skjema';

interface SkjemaProvider {
    skjemaState: SkjemaState;
    dispatch: Dispatch<SkjemaAction>;
}

const SkjemaStateContext = createContext<SkjemaProvider>({} as any);

const getInitialArgs = () => ({ startTid: Date.now(), hasInitialized: false });

function SkjemaStateProvider({
    children,
    // eksisterendeOpplysninger,
}: {
    children: React.ReactNode;
    // eksisterendeOpplysninger?: SkjemaState;
}) {
    const [skjemaState, dispatch] = useReducer(skjemaReducer, undefined, getInitialArgs);
    const contextValue = {
        skjemaState,
        dispatch,
    };
    return <SkjemaStateContext.Provider value={contextValue}>{children}</SkjemaStateContext.Provider>;
}

function useSkjemaState() {
    const context = useContext(SkjemaStateContext);
    if (context === undefined) {
        throw new Error('useSkjemaState må brukes under en SkjemaStateProvider');
    }

    return context;
}

export { SkjemaStateProvider, useSkjemaState };
