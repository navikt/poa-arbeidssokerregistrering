'use client';

import { BodyLong, Button, Dialog, Heading } from '@navikt/ds-react';
import { useRouter } from 'next/navigation';

import { lagHentTekstForSprak, Tekster } from '@navikt/arbeidssokerregisteret-utils';
import useSprak from '../../hooks/useSprak';
import { loggAktivitet, loggFlyt } from '@/lib/tracker';
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
    const tekst = lagHentTekstForSprak(TEKSTER, useSprak());
    const Router = useRouter();

    const avbrytRegistrering = () => {
        loggAktivitet({ aktivitet: 'Avbryter registreringen' });
        loggFlyt({ hendelse: 'Avbryter registreringen' });
        Router.push('/');
    };

    return (
        <>
            <Dialog aria-label={tekst('ariaLabel')}>
                <Dialog.Trigger>
                    <Button variant={'tertiary'} icon={<XMarkIcon title="a11y-title" fontSize="1.5rem" />}>
                        {tekst('avbryt')}
                    </Button>
                </Dialog.Trigger>
                <Dialog.Popup width="small">
                    <Dialog.Header>
                        <Heading level={'1'} size={'medium'}>
                            {tekst('avbryt')}
                        </Heading>
                    </Dialog.Header>
                    <Dialog.Body>
                        <BodyLong>{tekst('erDuSikker')}</BodyLong>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Button variant="secondary" onClick={avbrytRegistrering} className="w-40">
                            {tekst('knappJa')}
                        </Button>
                        <Dialog.CloseTrigger>
                            <Button variant="secondary" className="w-40">
                                {tekst('knappNei')}
                            </Button>
                        </Dialog.CloseTrigger>
                    </Dialog.Footer>
                </Dialog.Popup>
            </Dialog>
        </>
    );
};

export default Avbryt;
