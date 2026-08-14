'use client';

import type { Meta, StoryObj } from '@storybook/nextjs';
import { useEffect } from 'react';
import { ErrorProvider, useErrorContext } from '../../contexts/error-context';
import { FeilmeldingGenerell, GlobalFeilmelding } from './feilmeldinger';

const meta: Meta = {
    title: 'Feilmeldinger',
    tags: ['autodocs'],
    parameters: {
        nextjs: {
            appDirectory: true,
        },
    },
};

export default meta;
type Story = StoryObj;

/** Fullside teknisk feilmelding — vises på /feil/-siden */
export const Generell: Story = {
    name: 'Generell teknisk feil',
    render: () => <FeilmeldingGenerell />,
};

const GlobalFeilmeldingMedFeil = () => {
    const { setError } = useErrorContext();
    useEffect(() => {
        setError(new Error('Teknisk feil ved innsending'));
    }, [setError]);
    return <GlobalFeilmelding />;
};

/** Inline feilmelding med lukk-knapp — vises når noe feiler midt i flyten */
export const Global: Story = {
    name: 'Global feilmelding',
    render: () => (
        <ErrorProvider>
            <GlobalFeilmeldingMedFeil />
        </ErrorProvider>
    ),
};

/** Global feilmelding uten aktiv feil — komponenten rendrer ingenting */
export const GlobalUtenFeil: Story = {
    name: 'Global feilmelding (ingen feil)',
    render: () => (
        <ErrorProvider>
            <GlobalFeilmelding />
        </ErrorProvider>
    ),
};
