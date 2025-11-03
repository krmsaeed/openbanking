import { virtualOpenDepositLogin } from '@/services/login';
import { NextResponse } from 'next/server';

async function handler() {
    try {
        const response = await virtualOpenDepositLogin();

        if (response.status === 200) {
            return NextResponse.json(response.data ?? {}, { status: 200 });
        }

        return NextResponse.json(
            {
                status: response.status,
                error: response.data ?? 'Login failed',
            },
            { status: response.status || 400 }
        );
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const POST = handler;
