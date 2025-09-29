import { NextRequest, NextResponse } from 'next/server';
import { virtualOpenDepositKeKycUserVideo } from '@/services/bpms';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const messageDTO = formData.get('messageDTO') as string;
        const files = formData.getAll('files') as File[];

        if (!messageDTO || !files.length) {
            return NextResponse.json({ error: 'Missing messageDTO or files' }, { status: 400 });
        }

        const message = JSON.parse(messageDTO);
        const { serviceName, processId, formName } = message;

        if (serviceName !== 'virtual-open-deposit' || formName !== 'ImageInquiry' || !processId) {
            return NextResponse.json({ error: 'Invalid messageDTO' }, { status: 400 });
        }

        const resp = await virtualOpenDepositKeKycUserVideo(processId, files);
        const normalizeResp = (r: unknown) => {
            if (!r || typeof r !== 'object') return { status: undefined as number | undefined, data: undefined as unknown, message: undefined as string | undefined };
            const obj = r as Record<string, unknown>;
            return { status: typeof obj.status === 'number' ? obj.status : undefined, data: obj.data, message: typeof obj.message === 'string' ? obj.message : undefined };
        };

        const n = normalizeResp(resp);
        if (n.status === 200) return NextResponse.json({ ...(Object(n.data) as Record<string, unknown>) }, { status: 200 });
        return NextResponse.json({ error: n.message || 'Internal Server Error' }, { status: n.status || 500 });
    } catch (error) {
        console.error('Error in virtual-open-deposit-KeKyc-User-vido:', error);
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

        return NextResponse.json({ error: extractMessage(error) }, { status: 500 });
    }
}