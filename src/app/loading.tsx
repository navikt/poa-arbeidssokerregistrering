import { Box, Loader } from '@navikt/ds-react';

export default function Loading() {
    return (
        <Box width="100%" maxWidth="768px" marginInline="auto" paddingInline="space-16" paddingBlock="space-32">
            <Loader size="xlarge" title="Laster innhold..." />
        </Box>
    );
}
