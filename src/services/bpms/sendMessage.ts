import { handleResponse } from "@/lib/setResponse";
import axios from "axios";

export interface SendMessageResponse {
    success: boolean;
    [key: string]: unknown;
}
export type SendMessageRequest = { code: string } | { serviceName: string; body: { code: string }; processId?: number };
export async function sendMessage(body: SendMessageRequest) {
    const baseUrl = process.env.BASE_URL || '';
    const response = await axios.post(`${baseUrl}/bpms/sendMessage`, body);
    return handleResponse(response)
}

