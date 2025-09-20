import { NextRequest, NextResponse } from 'next/server';
import { virtualOpenDepositInit } from '@/services/bpms';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const code = typeof body === 'string' ? body : body?.code;
        if (!code) {
            return NextResponse.json({ error: 'Missing code' }, { status: 400 });
        }

        const resp = await virtualOpenDepositInit(code);
        const normalizeResp = (r: unknown) => {
            if (!r || typeof r !== 'object') return { status: undefined as number | undefined, data: undefined as unknown, message: undefined as string | undefined };
            const obj = r as Record<string, unknown>;
            return { status: typeof obj.status === 'number' ? obj.status : undefined, data: obj.data, message: typeof obj.message === 'string' ? obj.message : undefined };
        };

        const n = normalizeResp(resp);
        if (n.status === 200) return NextResponse.json({ ...(Object(n.data) as Record<string, unknown>) }, { status: 200 });
        return NextResponse.json({ error: n.message || 'Internal Server Error' }, { status: n.status || 500 });
    } catch (err: unknown) {
        const extractMessage = (e: unknown): string => {
            if (!e) return 'Internal Server Error';
            if (typeof e === 'string') return e;
            if (typeof e === 'object') {
                const maybe = (e as { [k: string]: unknown })['message'];
                if (typeof maybe === 'string') return maybe;
            }
            try {
                return JSON.stringify(e) || 'Internal Server Error';
            } catch {
                return 'Internal Server Error';
            }
        };

        return NextResponse.json({ error: extractMessage(err) }, { status: 500 });
    }
}
