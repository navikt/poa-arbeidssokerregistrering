import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

jest.mock('next/router', () => require('next-router-mock'));
expect.extend(toHaveNoViolations);
import DineOpplysninger from './dine-opplysninger';

describe('tester komponenten DineOpplysninger', () => {
    test('komponenten rendrer som forventet', () => {
        const { container } = render(<DineOpplysninger />);
        expect(container).not.toBeEmptyDOMElement();
    });

    test('sjekker komponenten DineOpplysninger med axe', async () => {
        const { container } = render(<DineOpplysninger />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
