import httpClient from '@/lib/httpClient';
import { handleResponse } from '../setResponse';

export interface ApiResponse<T = unknown> {
    status: number;
    data: T;
    response: T;
}

export async function virtualOpenDepositSendMessage<T>(payload: T, authToken?: string) {
    const config = authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : undefined;

    const apiResponse = await httpClient.post('/sendMessage', payload, config);
    return handleResponse(apiResponse);
}

export async function virtualOpenDepositKeKycUserFiles<T>(payload: T, authToken?: string) {
    const headers: Record<string, string> = {
        'Content-Type': 'multipart/form-data',
    };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const response = await httpClient.post('/sendMultiPartMessage', payload, {
        headers,
    });
    return handleResponse(response);
}

const bpms = {
    virtualOpenDepositSendMessage,
    virtualOpenDepositKeKycUserFiles,
};

export default bpms;
