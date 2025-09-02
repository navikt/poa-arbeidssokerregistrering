import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './index';

// Mock hooks and contexts
jest.mock('../hooks/useSprak', () => () => 'nb');
jest.mock('../contexts/config-context', () => ({
    useConfig: () => ({ enableMock: 'enabled' }),
}));
jest.mock('../components/redirect-til-vedlikehold', () => {
    const MockComponent = () => <div data-testid="redirect-vedlikehold" />;
    MockComponent.displayName = 'RedirectTilVedlikehold';
    return MockComponent;
});
// Ignore DemoPanel
jest.mock('../components/forsiden/demo-panel', () => ({
    __esModule: true,
    default: () => null,
}));
jest.mock('next/router', () => ({
    useRouter: jest.fn().mockReturnValue({ push: jest.fn(), query: {} }),
}));

describe('Home page', () => {
    it('renders the main texts, links, and button', () => {
        render(<Home />);
        expect(screen.getByText('Dette er testsiden for arbeidssøkerregistrering.')).toBeInTheDocument();

        // Find the "Dolly" link and check its parent for the combined sentence
        const dollyLink = screen.getByRole('link', { name: 'Dolly' });
        expect(dollyLink).toBeInTheDocument();
        expect(dollyLink.parentElement?.textContent).toContain(
            'Du må ha en testbruker fra Dolly for å kunne gjennomføre en registrering.',
        );
        expect(
            screen.getByText(
                'Dersom du ønsker å se siden arbeidssøkere møter når de skal registrere seg kan du gå til',
            ),
        ).toBeInTheDocument();
        expect(screen.getByText('startsiden for arbeidssøkerregistrering på nav.no')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Start registrering' })).toBeInTheDocument();
        expect(screen.getByTestId('redirect-vedlikehold')).toBeInTheDocument();
    });
});
