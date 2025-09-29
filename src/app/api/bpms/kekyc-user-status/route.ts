import { NextRequest, NextResponse } from 'next/server';
import { SendMessageRequest } from '@/services/bpms/sendMessage';

export async function POST(request: NextRequest) {

    const body = await request.json();
    const resp = await SendMessageRequest(body);
    const normalizeResp = (r: unknown) => {
        if (!r || typeof r !== 'object') return { status: undefined as number | undefined, data: undefined as unknown, message: undefined as string | undefined };
        const obj = r as Record<string, unknown>;
        return { status: typeof obj.status === 'number' ? obj.status : undefined, data: obj.data, message: typeof obj.message === 'string' ? obj.message : undefined };
    };

    const n = normalizeResp(resp);
    if (n.status === 200) return NextResponse.json({ ...(Object(n.data) as Record<string, unknown>) }, { status: 200 });
    return NextResponse.json({ error: n.message || 'Internal Server Error' }, { status: n.status || 500 });

}