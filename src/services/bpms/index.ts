import axios from 'axios';
import { handleResponse } from '../setResponse';
import { unknown } from 'zod';
export interface VirtualOpenDepositCustomerInfo {
    code: string;
    mobile?: string;
    birthDate?: string;
    postalCode?: string;
}
export interface VirtualOpenDepositInitPayload {
    [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
    status: number;
    data: T;
    response: T;
}
const baseUrl = process.env.BASE_URL;
export async function virtualOpenDepositInit(
    payload: VirtualOpenDepositInitPayload
): Promise<ReturnType<typeof unknown>> {
    if (!baseUrl) throw new Error('BASE_URL environment variable is required to call BPMS endpoints');
    const apiResponse = await axios.post(`${baseUrl}/bpms/sendMessage/`, payload);
    const response = {
        status: apiResponse.status ? 200 : 500,
        data: apiResponse.data,
        response: apiResponse.data,
    };
    return response.data
}


export async function virtualOpenDepositGetCustomerInfo(payload: VirtualOpenDepositCustomerInfo, processId?: number | null) {

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) throw new Error('BASE_URL environment variable is required to call BPMS endpoints');
    const apiResponse = await axios.post(`${baseUrl}/bpms/sendMessage`, {
        processId,
        body: payload,
    });

    const response = {
        status: apiResponse.status ? 200 : 500,
        data: apiResponse.data,
        response: apiResponse.data,
    };

    return handleResponse(response)
}

export interface VirtualOpenDepositKeKycUserStatusPayload {
    code: string;
    mobile: string;
    birthDate: string;
    postalCode: string;
}

export async function virtualOpenDepositKeKycUserStatus(payload: VirtualOpenDepositKeKycUserStatusPayload) {
    if (!baseUrl) throw new Error('BASE_URL environment variable is required to call BPMS endpoints');
    const resp = await axios.post(`${baseUrl}/bpms/sendMessage`, {
        payload
    });
    return handleResponse({ status: resp.status ? 200 : 500, data: resp.data, response: resp.data })
}

export interface VirtualOpenDepositKeKycUserImagePayload {
    code: string;
}

export async function virtualOpenDepositKeKycUserImage(payload: VirtualOpenDepositKeKycUserImagePayload, processId: number, files: File[]) {
    const formData = new FormData();
    formData.append('messageDTO', JSON.stringify({
        serviceName: 'virtual-open-deposit',
        processId,
        formName: 'GovahInquiry',
        body: payload,
    }));
    files.forEach(file => formData.append('files', file));
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) throw new Error('BASE_URL environment variable is required to call BPMS endpoints');
    const resp = await axios.post(`${baseUrl}/bpms/sendMultiPartMessage`, formData);
    return handleResponse({ status: resp.status ? 200 : 500, data: resp.data, response: resp.data });
}

export async function virtualOpenDepositKeKycUserVideo(processId: number, files: File[]) {
    const formData = new FormData();
    formData.append('messageDTO', JSON.stringify({
        serviceName: 'virtual-open-deposit',
        processId,
        formName: 'ImageInquiry',
        body: {},
    }));
    files.forEach(file => formData.append('files', file));
    if (!baseUrl) throw new Error('BASE_URL environment variable is required to call BPMS endpoints');
    const resp = await axios.post(`${baseUrl}/bpms/sendMultiPartMessage`, formData);
    return handleResponse({ status: resp.status ? 200 : 500, data: resp.data, response: resp.data });
}

const bpms = {
    virtualOpenDepositInit,
    virtualOpenDepositGetCustomerInfo,
    virtualOpenDepositKeKycUserStatus,
    virtualOpenDepositKeKycUserImage,
    virtualOpenDepositKeKycUserVideo,
};

export default bpms;
