import { NextRequest, NextResponse } from 'next/server';
import { virtualOpenDepositSendMessage } from '@/services/bpms';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const response = await virtualOpenDepositSendMessage(body);
    const normalizeResp = (r: unknown) => {
        if (!r || typeof r !== 'object') return {
            status: undefined as number | undefined,
            data: undefined as unknown, message: undefined as string | undefined
        };
        const obj = r as Record<string, unknown>;
        return {
            status: typeof obj.status === 'number' ? obj.status : undefined,
            data: obj.data, message: typeof obj.message === 'string' ? obj.message : undefined
        };
    };

    const NResponse = normalizeResp(response);
    if (NResponse.status === 200) return NextResponse.json({ ...(Object(NResponse.data) as Record<string, unknown>) },
        { status: 200 });
    return NextResponse.json({ error: NResponse.message || 'Internal Server Error' }, { status: NResponse.status || 500 });

}