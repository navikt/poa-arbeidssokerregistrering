import styles from './styles.module.css';
import { BodyShort } from '@navikt/ds-react';
import { ArrowRightIcon } from '@navikt/aksel-icons';

interface Props {
    href: string;
    title: string;
    description: string;
    onClick?: () => void;
}

const LenkePanel = (props: Props) => {
    const { href, title, description, onClick } = props;
    return (
        <a href={href} className={styles.LenkePanel} onClick={onClick}>
            <div className={styles.LenkePanel__container}>
                <BodyShort size={'medium'} className={styles.linkText}>
                    {title}
                </BodyShort>
                <BodyShort className={styles.tagline} size={'medium'}>
                    {description}
                </BodyShort>
            </div>
            <ArrowRightIcon title="Pil ikon" fontSize="1.5rem" />
        </a>
    );
};

export default LenkePanel;
