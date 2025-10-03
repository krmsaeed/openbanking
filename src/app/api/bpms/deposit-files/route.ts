import { NextRequest, NextResponse } from 'next/server';
import { virtualOpenDepositKeKycUserFiles } from '@/services/bpms';

export async function POST(request: NextRequest) {
    const data = await request.formData();
    const response = await virtualOpenDepositKeKycUserFiles(data);

    if (response.status === 200)
        return NextResponse.json({ ...(response.data || {}) }, { status: 200 });
    return NextResponse.json(
        { error: response || 'Internal Server Error' },
        { status: response.status || 500 }
    );
}
