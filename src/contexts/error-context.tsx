import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';

interface ErrorProviderType {
    error: Error | null;
    setError: (error: Error | null) => void;
    medFeilHandtering: (fn: Function) => void;
}

const ErrorContext = createContext<ErrorProviderType>({
    error: null,
    setError: () => {},
    medFeilHandtering: () => {},
});

function ErrorProvider({ children }: { children: ReactNode }) {
    const [error, setError] = useState<Error | null>(null);

    const contextValue = {
        error,
        setError: useCallback((error: Error | null) => setError(error), [setError]),
        medFeilHandtering: useCallback(
            async (fn: Function) => {
                try {
                    await fn();
                } catch (e) {
                    setError(e as Error);
                }
            },
            [setError],
        ),
    };

    return <ErrorContext.Provider value={contextValue}>{children}</ErrorContext.Provider>;
}

function useErrorContext() {
    const context = useContext(ErrorContext);

    if (context === undefined) {
        throw new Error('useErrorContext må brukes under en ErrorProvider');
    }

    return context;
}

export { ErrorProvider, useErrorContext };
