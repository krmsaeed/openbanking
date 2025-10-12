import { withAuth, type AuthenticatedRequest } from '@/lib/authMiddleware';
import { virtualOpenDepositKeKycUserFiles } from '@/services/bpms';
import { NextResponse } from 'next/server';

async function handler(request: AuthenticatedRequest) {
    try {
        const data = await request.formData();
        const response = await virtualOpenDepositKeKycUserFiles(data);

        if (response.status === 200) {
            return NextResponse.json({ ...(response.data || {}) }, { status: 200 });
        }

        return NextResponse.json(
            { error: response || 'Internal Server Error' },
            { status: response.status || 500 }
        );
    } catch (error) {
        console.error('BPMS deposit files error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const POST = withAuth(handler);
