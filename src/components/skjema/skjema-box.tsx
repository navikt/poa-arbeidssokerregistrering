import styles from '../../styles/skjema.module.css';
import { Box } from '@navikt/ds-react';

export const SkjemaBox = (props: any) => {
    return (
        <Box className={styles.box} padding="4" borderWidth="1" borderColor="border-default" borderRadius={'small'}>
            {props.children}
        </Box>
    );
};
