import { useState } from 'react';
import { BodyLong, Button, Heading, Link, Modal, Panel } from '@navikt/ds-react';
import { useRouter } from 'next/router';

import lagHentTekstForSprak, { Tekster } from '../../lib/lag-hent-tekst-for-sprak';
import useSprak from '../../hooks/useSprak';
import { loggAktivitet, loggFlyt } from '../../lib/amplitude';

const TEKSTER: Tekster<string> = {
    nb: {
        avbryt: 'Avbryt registreringen',
        erDuSikker: 'Er du sikker på at du vil avbryte registreringen?',
        knappJa: 'Ja, avbryt',
        knappNei: 'Nei',
        ariaLabel: 'Bekreft at du ønsker å avbryte registreringen',
    },
    en: {
        avbryt: 'Cancel the registration',
        erDuSikker: 'Are you sure you want to cancel the registration?',
        knappJa: 'Yes, cancel',
        knappNei: 'No',
        ariaLabel: 'Confirm the cancellation',
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
                    <BodyLong className={'mbm'}>{tekst('erDuSikker')}</BodyLong>
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
            <div className="text-center py-4">
                <Link href="#" onClick={() => setOpen(true)}>
                    {tekst('avbryt')}
                </Link>
            </div>
        </>
    );
};

export default Avbryt;
