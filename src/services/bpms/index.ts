import axios from 'axios';
import { handleResponse } from '../setResponse';

export interface ApiResponse<T = unknown> {
    status: number;
    data: T;
    response: T;
}
const baseUrl = process.env.BASE_URL;
export async function virtualOpenDepositSendMessage<T>(payload: T) {
    const apiResponse = await axios.post(`${baseUrl}/bpms/sendMessage/`, payload);
    return handleResponse(apiResponse);
}

export async function virtualOpenDepositKeKycUserFiles<T>(payload: T) {
    const baseUrl = process.env.BASE_URL;
    const response = await axios.post(`${baseUrl}/bpms/sendMultiPartMessage`, payload);
    return handleResponse(response);
}
const bpms = {
    virtualOpenDepositSendMessage,
    virtualOpenDepositKeKycUserFiles,
};

export default bpms;
