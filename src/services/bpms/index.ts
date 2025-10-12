import httpClient from '@/lib/httpClient';
import { handleResponse } from '../setResponse';

export interface ApiResponse<T = unknown> {
    status: number;
    data: T;
    response: T;
}

export async function virtualOpenDepositSendMessage<T>(payload: T) {
    const apiResponse = await httpClient.post('/sendMessage', payload);
    return handleResponse(apiResponse);
}

export async function virtualOpenDepositKeKycUserFiles<T>(payload: T) {
    const response = await httpClient.post('/sendMultiPartMessage', payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return handleResponse(response);
}

const bpms = {
    virtualOpenDepositSendMessage,
    virtualOpenDepositKeKycUserFiles,
};

export default bpms;
