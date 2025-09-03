export const fetcher = async (url: string) => {
    const headers: HeadersInit = {};

    if (url.includes('indianapi.in')) {
        const apiKey = process.env.NEXT_PUBLIC_INDIAN_API_KEY;
        if (apiKey) {
            headers['X-API-Key'] = apiKey;
        } else {
            console.error('Indian API key is not set in .env.local');
        }
    }

    const res = await fetch(url, { headers });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message = errorData?.message || `An error occurred: ${res.statusText}`;
        throw new Error(message);
    }

    return res.json();
};