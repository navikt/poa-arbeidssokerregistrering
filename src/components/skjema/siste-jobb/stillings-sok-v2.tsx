import type { SisteJobb } from '@navikt/arbeidssokerregisteret-utils';
import { UNSAFE_Combobox } from '@navikt/ds-react';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import config from '@/config';
import { loggAktivitet } from '@/lib/tracker';

interface StillingsSokProps {
    onClose: (value?: SisteJobb) => void;
    label: string;
}

const annenStilling: SisteJobb = { konseptId: -1, label: 'Annen stilling', styrk08: '-1' };

const StillingsSok = (props: StillingsSokProps) => {
    const { onClose, label } = props;
    const [resultat, setResultat] = useState<SisteJobb[]>([]);
    const [value, setValue] = useState<string>('');
    const [henter, settHenter] = useState(false);
    const harLoggetEndring = useRef(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const inputId = useId();
    const { basePath } = config;

    useEffect(() => {
        if (!value.trim()) {
            setResultat([]);
            settHenter(false);
            return;
        }

        const controller = new AbortController();
        settHenter(true);
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(`${basePath}/api/yrke-med-styrk-v2/?yrke=${encodeURIComponent(value)}`, {
                    signal: controller.signal,
                });
                if (!response.ok) throw new Error('Stillingssøket feilet');
                const stillinger = (await response.json()) as SisteJobb[];
                if (!controller.signal.aborted) setResultat([...stillinger, annenStilling]);
            } catch {
                if (!controller.signal.aborted) setResultat([annenStilling]);
            } finally {
                if (!controller.signal.aborted) settHenter(false);
            }
        }, 200);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [value]);

    const options = resultat.map((stilling) => ({ label: stilling.label, value: String(stilling.konseptId) }));

    useLayoutEffect(() => {
        // Aksel 8.20 navngir inputen, men ikke den interne listeboksen.
        if (resultat.length === 0) return;
        const input = inputRef.current;
        const controlsId = input?.getAttribute('aria-controls');
        if (!input || !controlsId) return;
        const listbox = input.ownerDocument.getElementById(controlsId)?.querySelector('ul');
        if (listbox?.getAttribute('role') === 'listbox') listbox.setAttribute('aria-label', label);
    }, [label, resultat]);

    return (
        <UNSAFE_Combobox
            ref={inputRef}
            id={inputId}
            label={label}
            autoFocus
            options={options}
            filteredOptions={options}
            value={value}
            isLoading={henter}
            onChange={(nyVerdi) => {
                if (!harLoggetEndring.current) {
                    harLoggetEndring.current = true;
                    loggAktivitet({ aktivitet: 'Endrer foreslått stilling' });
                }
                setValue(nyVerdi);
            }}
            onToggleSelected={(valgtVerdi, erValgt) => {
                if (!erValgt) return;
                const stilling = resultat.find((alternativ) => String(alternativ.konseptId) === valgtVerdi);
                if (stilling) onClose(stilling);
            }}
            onKeyDownCapture={(event) => {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    event.stopPropagation();
                    onClose();
                }
            }}
        />
    );
};

export default StillingsSok;
