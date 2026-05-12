import type { Preview, Decorator } from '@storybook/nextjs';
import React from 'react';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { useParams } from '@storybook/nextjs/navigation.mock';
import '../src/styles/globals.css';

initialize();

/**
 * Setter useParams-mocken basert på sprak-globalen slik at useSprak()-hooken
 * plukker opp riktig språk. nb bruker root path (ingen lang-param).
 */
const withSprak: Decorator = (Story, context) => {
    const sprak = (context.globals.sprak ?? 'nb') as string;
    useParams.mockReturnValue(sprak === 'nb' ? {} : { lang: sprak });
    return <Story />;
};

const preview: Preview = {
    globalTypes: {
        sprak: {
            description: 'Språk / Language',
            toolbar: {
                title: 'Språk',
                icon: 'globe',
                items: [
                    { value: 'nb', title: 'Bokmål (nb)' },
                    { value: 'nn', title: 'Nynorsk (nn)' },
                    { value: 'en', title: 'English (en)' },
                ],
                dynamicTitle: true,
            },
            defaultValue: 'nb',
        },
    },
    decorators: [withSprak],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
    loaders: [mswLoader],
};

export default preview;
