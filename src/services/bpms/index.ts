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
    const response = {
        status: apiResponse.status,
        data: apiResponse.data,
        response: apiResponse.data,
    };
    return handleResponse(response);
}

export async function virtualOpenDepositKeKycUserFiles(payload: unknown) {
    const baseUrl = process.env.BASE_URL;
    const resp = await axios.post(`${baseUrl}/bpms/sendMultiPartMessage`, payload);
    const response = {
        status: resp.status,
        data: resp.data,
        response: resp.data,
    };
    return handleResponse(response);
}


const bpms = {
    virtualOpenDepositSendMessage,
    virtualOpenDepositKeKycUserFiles,
};

export default bpms;
