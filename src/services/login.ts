import axios from 'axios';
import { handleResponse } from './setResponse';

export interface ApiResponse<T = unknown> {
    status: number;
    data: T;
    response: T;
}

export async function virtualOpenDepositLogin() {
    const formData = {
        client_id: 'tasklist',
        grant_type: 'password',
        username: 'demo',
        password: 'demo',
        client_secret: 'XALaRPl5qwTEItdwCMiPS62nVpKs7dL7',
    };

    const baseUrl =
        typeof window !== 'undefined' ? '' : `http://localhost:${process.env.PORT || 3000}`;

    const apiUrl = `${baseUrl}/api/auth/login`;

    try {
        const apiResponse = await axios.post(apiUrl, formData, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });

        return handleResponse(apiResponse);
    } catch (error) {
        const axiosError = error as { response?: { status?: number; data?: unknown } };
        const errorResponse = {
            status: axiosError.response?.status || 500,
            data: axiosError.response?.data || { message: 'Network Error' },
            response: axiosError.response?.data || { message: 'Network Error' },
        };
        return handleResponse(errorResponse);
    }
}
