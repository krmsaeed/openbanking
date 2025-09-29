import { handleResponse } from "@/lib/setResponse";
import axios from "axios";

export interface SendMessageResponse {
    status: boolean;
    [key: string]: unknown;
}
export async function SendMessageRequest<T>(body: T) {
    const baseUrl = process.env.BASE_URL || "";
    if (!baseUrl) throw new Error('BASE_URL environment variable is required to call BPMS endpoints');
    const response = await axios.post(`${baseUrl}/bpms/sendMessage`, body);
    return handleResponse(response)
}

