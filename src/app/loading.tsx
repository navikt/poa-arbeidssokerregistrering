import { Loader } from '@navikt/ds-react';

export default function Loading() {
    return (
        <div className="flex flex-col max-w-3xl mx-auto px-4 py-8">
            <Loader size="xlarge" title="Laster innhold..." />
        </div>
    );
}
