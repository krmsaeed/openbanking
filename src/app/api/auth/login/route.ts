import axios from 'axios';
import https from 'https';
import { NextRequest, NextResponse } from 'next/server';

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const formData = new URLSearchParams();
        formData.append('client_id', body.client_id || 'tasklist');
        formData.append('grant_type', body.grant_type || 'password');
        formData.append('username', body.username || 'demo');
        formData.append('password', body.password || 'demo');
        formData.append('client_secret', body.client_secret || 'XALaRPl5qwTEItdwCMiPS62nVpKs7dL7');

        const response = await axios.post(
            'https://10.224.2.3:8443/auth/realms/camunda-platform/protocol/openid-connect/token',
            formData.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                httpsAgent,
                timeout: 10000,
                validateStatus: (status) => status < 600,
            }
        );

        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status || 500;
            const errorData = {
                error: 'Authentication failed',
                message: error.message,
                details: error.response?.data,
                code: error.code,
            };

            return NextResponse.json(errorData, { status });
        }

        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
