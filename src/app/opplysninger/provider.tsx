'use client';

import { createContext, Dispatch, useContext, useReducer } from 'react';
import { SkjemaAction, skjemaReducer } from '@/lib/skjema-state';
import { SkjemaState } from '@/model/skjema';

interface SkjemaProvider {
    skjemaState: SkjemaState;
    dispatch: Dispatch<SkjemaAction>;
}

const SkjemaStateContext = createContext<SkjemaProvider>({} as any);

const initializer = (skjemaState: SkjemaState) => {
    return skjemaState;
};

const initialArgs = () => ({ startTid: Date.now() });

function SkjemaStateProvider({ children }: { children: React.ReactNode }) {
    const [skjemaState, dispatch] = useReducer(skjemaReducer, initialArgs(), initializer);
    const contextValue = {
        skjemaState,
        dispatch,
    };
    console.log('skjemaStateProvider!', skjemaState);
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
