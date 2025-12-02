import { withAuth, type AuthenticatedRequest } from '@/lib/authMiddleware';
import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function handler(request: AuthenticatedRequest) {
    try {
        const formData = await request.formData();
        const authToken = request.auth?.token;

        const backendRes = await axios.post(`${BACKEND_BASE_URL}/bpms/sendMultiPartMessage`, formData, {
            headers: {
                ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
            httpsAgent,
            validateStatus: () => true,
        });

        const data = backendRes.data;

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

        return NextResponse.json(data, { status: backendRes.status });
    } catch {
        return NextResponse.json(
            {
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
