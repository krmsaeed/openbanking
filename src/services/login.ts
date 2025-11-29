import axios from 'axios';
import { handleResponse } from './setResponse';

export interface ApiResponse<T = unknown> {
    status: number;
    data: T;
    response: T;
}

export async function virtualOpenDepositLogin() {
    const formData = new URLSearchParams();
    formData.append('client_id', 'tasklist');
    formData.append('grant_type', 'password');
    formData.append('username', 'demo');
    formData.append('password', 'demo');
    formData.append('client_secret', 'XALaRPl5qwTEItdwCMiPS62nVpKs7dL7');

    try {
        const apiResponse = await axios.post(
            `${process.env.BASE_URL}/auth/token`,
            new URLSearchParams({
                client_id: "tasklist",
                grant_type: "password",
                username: "demo",
                password: "demo",
                client_secret: "XALaRPl5qwTEItdwCMiPS62nVpKs7dL7"
            }),


            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        return handleResponse(apiResponse);
    } catch (error) {
        // Convert axios error to response format for handleResponse
        const axiosError = error as { response?: { status?: number; data?: unknown } };
        const errorResponse = {
            status: axiosError.response?.status || 500,
            data: axiosError.response?.data || { message: 'Network Error' },
            response: axiosError.response?.data || { message: 'Network Error' },
        };
        return handleResponse(errorResponse);
    }
}
