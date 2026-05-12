import type { Preview, Decorator } from '@storybook/nextjs';
import React from 'react';
import { initialize, mswLoader } from 'msw-storybook-addon';
import '../src/styles/globals.css';

initialize();

/**
 * Decorator som sender sprak-global videre til nextjs navigation params.
 * useSprak() henter lang fra useParams(), som @storybook/nextjs mocker.
 * nb bruker root path (ingen lang-param), nn/en sender lang-param.
 */
const withSprak: Decorator = (Story, context) => {
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
        nextjs: {
            appDirectory: true,
            navigation: {
                params: {},
            },
        },
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
