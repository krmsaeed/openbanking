import { sendMessage } from '@/services/bpms/sendMessage';
import { virtualOpenDepositInit, virtualOpenDepositGetCustomerInfo, VirtualOpenDepositCustomerInfo } from '@/services/bpms';
import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
    const body = await req.json();

    
    const normalizeResp = (r: unknown) => {
        if (!r || typeof r !== 'object') return { status: undefined as number | undefined, data: undefined as unknown, message: undefined as string | undefined };
        const obj = r as Record<string, unknown>;
        return { status: typeof obj.status === 'number' ? obj.status : undefined, data: obj.data, message: typeof obj.message === 'string' ? obj.message : undefined };
    };

    
    if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'processId')) {
        const typed = body as Record<string, unknown>;
        const processId = typed['processId'];
        const payload = (typed['body'] ?? typed) as Record<string, unknown>;
        const typedPayload = payload as unknown as VirtualOpenDepositCustomerInfo;
        const resp = await virtualOpenDepositGetCustomerInfo(typedPayload, Number(processId));
        const n = normalizeResp(resp);
        if (n.status === 200) return NextResponse.json({ ...(Object(n.data) as Record<string, unknown>) }, { status: 200 });
        return NextResponse.json({ error: n.message || 'Internal Server Error' }, { status: n.status || 500 });
    }

    
    if (body && typeof body === 'object') {
        const typed = body as Record<string, unknown>;
        if (typed['serviceName'] === 'virtual-open-deposit') {
            const inner = (typed['body'] ?? {}) as Record<string, unknown>;
            if (inner && inner['code']) {
                const resp = await virtualOpenDepositInit(String(inner['code']));
                const n = normalizeResp(resp);
                if (n.status === 200) return NextResponse.json({ ...(Object(n.data) as Record<string, unknown>) }, { status: 200 });
                return NextResponse.json({ error: n.message || 'Internal Server Error' }, { status: n.status || 500 });
            }
        }
    }

    
    const response = await sendMessage(body);
    if (response.status === 200) {
        return NextResponse.json({ ...response.data }, { status: 200 });
    }
    else {
        return NextResponse.json({ error: response.message || "Internal Server Error" }, { status: response.status || 500 });
    }
}