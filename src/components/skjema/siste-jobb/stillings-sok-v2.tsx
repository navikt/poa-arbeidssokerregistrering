import { useCallback, useState } from 'react';
import getConfig from 'next/config';
import { debounce } from 'lodash';

import { loggAktivitet } from '../../../lib/amplitude';

import styles from './autosuggest.module.css';

const Autosuggest = require('react-autosuggest');

interface StillingsSokProps {
    onClose: (value?: any) => void;
}

const annenStilling = { konseptId: -1, label: 'Annen stilling', styrk08: '-1' };

const StillingsSok = (props: StillingsSokProps) => {
    const { onClose } = props;
    const [resultat, setResultat] = useState([] as any[]);
    const [value, setValue] = useState<string>('');
    const [endret, setEndret] = useState<Boolean>(false);
    const { basePath } = getConfig().publicRuntimeConfig;

    const onSuggestionsFetchRequested = useCallback(
        debounce(async ({ value }: { value: string }) => {
            const url = `${basePath}/api/yrke-med-styrk-v2/?yrke=${value}`;
            const response = await fetch(url);
            const json = await response.json();
            const typeaheadYrkeList = json.typeaheadYrkeList;
            typeaheadYrkeList.push(annenStilling);
            setResultat(typeaheadYrkeList || [annenStilling]);
        }, 200),
        [basePath, setResultat],
    );

    const inputProps = {
        value,
        className: 'navds-text-field__input navds-body-short navds-body-medium',
        autoFocus: true,
        onBlur: () => onClose(),
        onChange: (e: any) => {
            if (e.type === 'change') {
                if (!endret) {
                    setEndret(true);
                    loggAktivitet({ aktivitet: 'Endrer foreslått stilling' });
                }
                setValue(e.target.value);
            }
        },
    };

    return (
        <div className={styles.stillingsSokWrapper}>
            <Autosuggest
                theme={styles}
                suggestions={resultat}
                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                onSuggestionsClearRequested={() => setResultat([])}
                getSuggestionValue={(val: any) => {
                    return val;
                }}
                onSuggestionSelected={(event: any, { suggestionValue }: { suggestionValue: any }) => {
                    onClose(suggestionValue);
                }}
                renderSuggestion={(val: any) => {
                    return <span>{val.label}</span>;
                }}
                inputProps={inputProps}
            />
        </div>
    );
};

export default StillingsSok;
