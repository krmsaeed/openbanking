import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

// Runtime environment variables for server-side
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const USERNAME = process.env.BPMS_USERNAME || 'khanoumi';
const PASSWORD = process.env.BPMS_PASSWORD || '123456';

const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

export async function POST() {
    try {
        console.log('=== Login API Called ===');
        console.log('BACKEND_BASE_URL:', BACKEND_BASE_URL);
        console.log('USERNAME:', USERNAME);

        const body = new URLSearchParams();
        body.append('client_id', 'tasklist');
        body.append('grant_type', 'password');
        body.append('username', USERNAME);
        body.append('password', PASSWORD);
        body.append('client_secret', 'XALaRPl5qwTEItdwCMiPS62nVpKs7dL7');

        console.log('Calling backend with axios...');

        const backendRes = await axios.post(`${BACKEND_BASE_URL}/auth/token`, body.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            httpsAgent,
            validateStatus: () => true, // Accept any status
        });

        console.log('Backend response status:', backendRes.status);
        console.log('Backend response headers:', backendRes.headers);

        return NextResponse.json(backendRes.data, { status: backendRes.status });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            {
                digitalMessageException: {
                    code: 500,
                    message: 'عدم برقراری ارتباط با سرور',
                },
            },
            { status: 500 }
        );
    }
}
