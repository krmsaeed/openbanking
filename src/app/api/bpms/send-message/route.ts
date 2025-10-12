import { withAuth, type AuthenticatedRequest } from '@/lib/authMiddleware';
import { virtualOpenDepositSendMessage } from '@/services/bpms';
import { NextResponse } from 'next/server';

async function handler(request: AuthenticatedRequest) {
    try {
        const body = await request.json();

        const requestBody = {
            ...body,
        };
        const response = await virtualOpenDepositSendMessage(requestBody);

        if (response.status === 200) {
            return NextResponse.json({ ...response }, { status: 200 });
        }

        return NextResponse.json({ error: response }, { status: response.status || 400 });
    } catch (error) {
        console.error('BPMS send message error:', error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

export const POST = withAuth(handler);
