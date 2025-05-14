import { useState } from 'react';
import { BodyLong, Button, Heading, Link, Modal, Panel } from '@navikt/ds-react';
import { useRouter } from 'next/router';

import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import useSprak from '../../hooks/useSprak';
import { loggAktivitet, loggFlyt } from '../../lib/amplitude';
import { XMarkIcon } from '@navikt/aksel-icons';

const TEKSTER: Tekster<string> = {
    nb: {
        avbryt: 'Avbryt registreringen',
        erDuSikker: 'Er du sikker på at du vil avbryte registreringen?',
        knappJa: 'Ja, avbryt',
        knappNei: 'Nei',
        ariaLabel: 'Bekreft at du ønsker å avbryte registreringen',
    },
    nn: {
        avbryt: 'Avbryt registreringa',
        erDuSikker: 'Er du sikker på at du vil avbryte registreringa?',
        knappJa: 'Ja, avbryt',
        knappNei: 'Nei',
        ariaLabel: 'Bekreft at du ønskjer å avbryte registreringa',
    },
    en: {
        avbryt: 'Cancel registration',
        erDuSikker: 'Are you sure you want to cancel your registration? ',
        knappJa: 'Yes',
        knappNei: 'No',
        ariaLabel: 'Confirm that you want to cancel your registration',
    },
};

const Avbryt = () => {
    const [open, setOpen] = useState(false);
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const Router = useRouter();

    const avbrytRegistrering = () => {
        loggAktivitet({ aktivitet: 'Avbryter registreringen' });
        loggFlyt({ hendelse: 'Avbryter registreringen' });
        setOpen(false);
        Router.push('/');
    };

    return (
        <>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                aria-label={tekst('ariaLabel')}
                header={{ heading: tekst('avbryt') }}
            >
                <Modal.Body>
                    <BodyLong className={'mb-6'}>{tekst('erDuSikker')}</BodyLong>
                    <div className="flex justify-evenly">
                        <Button variant="secondary" onClick={avbrytRegistrering} className="w-40">
                            {tekst('knappJa')}
                        </Button>
                        <Button variant="secondary" onClick={() => setOpen(false)} className="w-40">
                            {tekst('knappNei')}
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
            <div className="pb-4">
                <Link href="#" onClick={() => setOpen(true)}>
                    <XMarkIcon title="a11y-title" fontSize="1.5rem" /> {tekst('avbryt')}
                </Link>
            </div>
        </>
    );
};

export default Avbryt;
