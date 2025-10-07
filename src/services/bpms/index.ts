import bpmsApiClient from '@/lib/bpmsApiClient';
import { handleResponse } from '../setResponse';

export interface ApiResponse<T = unknown> {
    status: number;
    data: T;
    response: T;
}

/**
 * Send a message via BPMS (with Bearer token authentication)
 */
export async function virtualOpenDepositSendMessage<T>(payload: T) {
    const apiResponse = await bpmsApiClient.post('/sendMessage/', payload);
    return handleResponse(apiResponse);
}

/**
 * Upload user files to BPMS (with Bearer token authentication)
 */
export async function virtualOpenDepositKeKycUserFiles<T>(payload: T) {
    const response = await bpmsApiClient.post('/sendMultiPartMessage', payload, {
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
