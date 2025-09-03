import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Home from './index';

jest.mock('../hooks/useSprak', () => () => 'nb');
jest.mock('../contexts/config-context', () => ({
    useConfig: () => ({ enableMock: 'enabled' }),
}));
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        prefetch: jest.fn(),
        query: {},
    }),
}));
jest.mock('../contexts/featuretoggle-context', () => ({
    useFeatureToggles: () => ({ toggles: {} }),
    tilAktiveFeatures: jest.fn(() => ({})),
}));
jest.mock('next/link', () => {
    const MockLink = ({ children }: { children: React.ReactNode }) => <>{children}</>;
    MockLink.displayName = 'MockLink';
    return MockLink;
});
expect.extend(toHaveNoViolations);

describe('Tester Home (root for arbeidssøkerregistrering i dev only)', () => {
    it('komponenten rendrer som forventet', () => {
        // render(<Home />);
        const { container } = render(<Home />);
        expect(container).not.toBeEmptyDOMElement();
        expect(screen.getByText(/Dette er testsiden for arbeidssøkerregistrering/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /start registrering/i })).toBeInTheDocument();
    });

    it('sjekker komponenten Home med axe', async () => {
        const { container } = render(<Home />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
