import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';
import { withAuth, type AuthenticatedRequest } from '@/lib/authMiddleware';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function handler(request: AuthenticatedRequest) {
    try {
        if (!BACKEND_BASE_URL) {
            return NextResponse.json({ error: 'NEXT_PUBLIC_BASE_URL is not configured' }, { status: 500 });
        }

        const token = request.auth?.token;
        const url = `${BACKEND_BASE_URL}/errors/getAll`;

        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            httpsAgent,
            timeout: 15000,
            validateStatus: () => true,
        });

        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.error('Error fetching errors:', error);
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

export const GET = withAuth(handler);