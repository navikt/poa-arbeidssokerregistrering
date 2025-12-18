import config from '@/config';

const { basePath } = config;

const getUrl = (path: string) => `${basePath}/${path}`;
type FetchError = Error & {
    status?: number;
    data?: any;
};
export const fetcher = async (path: string, opts?: RequestInit & { onError?: (response: any) => void }) => {
    const response = await fetch(getUrl(path), {
        ...opts,
        credentials: 'include',
    });

    const contentType = response.headers.get('Content-Type');
    const isJsonResponse = contentType && /application\/json/.test(contentType);

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('401');
        } else if (typeof opts?.onError === 'function') {
            return opts.onError(response);
        }
        const error: FetchError = new Error(response.statusText);
        error.status = response.status;
        error.data = isJsonResponse ? await response.json() : undefined;
        throw error;
    }

    if (isJsonResponse) {
        return await response.json();
    }
};
