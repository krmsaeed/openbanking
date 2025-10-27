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

    const apiResponse = await axios.post(
        'http://192.168.91.112:18080/auth/realms/camunda-platform/protocol/openid-connect/token',
        formData,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );

    return handleResponse(apiResponse);
}
