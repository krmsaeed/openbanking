import httpClient from '@/lib/httpClient';

export interface ApiResponse<T = unknown> {
    status: number;
    data: T;
    response: T;
}

export async function virtualOpenDepositSendMessage<T>(payload: T, authToken?: string) {
    const config = authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : undefined;
    const response = await httpClient.post('/sendMessage', payload, config);
    return { status: response.status, data: response.data };
}

export async function virtualOpenDepositKeKycUserFiles<T>(payload: T, authToken?: string) {
    const config = authToken
        ? {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${authToken}`,
            },
        }
        : undefined;
    const response = await httpClient.post('/sendMultiPartMessage', payload, config);
    return { status: response.status, data: response.data };
}

const bpms = {
    virtualOpenDepositSendMessage,
    virtualOpenDepositKeKycUserFiles,
};

export default bpms;
