import { NextRequest, NextResponse } from 'next/server';
import { virtualOpenDepositInit } from '@/services/bpms';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const resp = await virtualOpenDepositInit(body);
    return NextResponse.json({ ...resp }, { status: 200 });
}
