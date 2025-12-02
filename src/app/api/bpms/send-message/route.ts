import { withAuth, type AuthenticatedRequest } from '@/lib/authMiddleware';
import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function handler(request: AuthenticatedRequest) {
    try {
        const body = await request.json();
        const authToken = request.auth?.token;

        const backendRes = await axios.post(`${BACKEND_BASE_URL}/bpms/sendMessage`, body, {
            headers: {
                'Content-Type': 'application/json',
                ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
            httpsAgent,
            validateStatus: () => true,
        });

        const data = backendRes.data;

        // اگر backend status 200 و exception وجود دارد → status 400 بده
        if (backendRes.status === 200 && data?.digitalMessageException) {
            const exception = data.digitalMessageException;
            const errorResponse = {
                ...data,
                digitalMessageException: {
                    code: exception.code || exception.errorCode,
                    errorKey: exception.errorKey,
                    message: exception.message,
                },
            };
            return NextResponse.json(errorResponse, { status: 400 });
        }

        if (backendRes.status === 200) {
            return NextResponse.json(data, { status: 200 });
        }

        return NextResponse.json({ error: data }, { status: backendRes.status || 400 });

    } catch (error) {
        const errorData = error && typeof error === 'object' && 'response' in error
            ? error?.response
            : undefined;

        return NextResponse.json(
            {
                errorData,
                digitalMessageException: {
                    errorCode: 500,
                    message: 'عدم برقراری ارتباط با سرور',
                },
            },
            { status: 500 }
        );
    }
}

export const POST = withAuth(handler);
