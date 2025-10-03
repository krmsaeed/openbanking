import { NextRequest, NextResponse } from 'next/server';
import { virtualOpenDepositSendMessage } from '@/services/bpms';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const response = await virtualOpenDepositSendMessage(body);
    if (response.status === 200) return NextResponse.json({ ...response }, { status: 200 });
    return NextResponse.json(
        { error: response || 'Internal Server Error' },
        { status: response.status || 500 }
    );
}
