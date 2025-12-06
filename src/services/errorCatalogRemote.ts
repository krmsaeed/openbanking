import httpClient from '@/lib/httpClient';

export type RemoteError = {
    id?: number;
    code?: number;
    errorKey?: string;
    message?: string;
    locale?: string;
    isDeleted?: boolean;
    createDateTime?: string;
    updateDateTime?: string;
    [k: string]: unknown;
};

function buildErrorsUrl(): string {
    const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '');
    if (!base) {
        throw new Error('NEXT_PUBLIC_BASE_URL is not configured');
    }
    return `${base}/errors/getAll`;
}

function normalizePayload(payload: unknown): RemoteError[] {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (
        payload &&
        typeof payload === 'object' &&
        Array.isArray((payload as { items?: unknown[] }).items)
    ) {
        return (payload as { items: RemoteError[] }).items;
    }

    return [];
}

export async function fetchRemoteErrorCatalog(): Promise<RemoteError[]> {
    const url = buildErrorsUrl();
    const response = await httpClient.get(url, {
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 15000,
    });

    return normalizePayload(response.data);
}
