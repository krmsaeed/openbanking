import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const nationalId = searchParams.get('nationalId');
    const mobile = searchParams.get('mobile');
    const randomFlag = searchParams.get('random');

    if (nationalId && mobile) {
        if (randomFlag === 'true' || randomFlag === '1') {
            return NextResponse.json(makeRandomResponse(nationalId, mobile));
        }

        const resp = makeFakeResponse(nationalId, mobile);
        return NextResponse.json(resp);
    }

    return NextResponse.json({
        success: false,
        error: 'کد ملی یا شماره موبایل ارسال نشده است'
    }, { status: 400 });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const nationalId = body?.nationalId ?? body?.nid ?? null;
        const mobile = body?.mobile ?? body?.phone ?? null;
        const randomFlag = body?.random ?? body?.rand ?? null;

        if (nationalId && mobile) {
            if (randomFlag === true || randomFlag === 'true' || randomFlag === '1') {
                return NextResponse.json(makeRandomResponse(nationalId, mobile));
            }

            return NextResponse.json(makeFakeResponse(nationalId, mobile));
        }

        return NextResponse.json({ success: false, error: 'missing nationalId or mobile' }, { status: 400 });
    } catch {
        return NextResponse.json({ success: false, error: 'invalid JSON' }, { status: 400 });
    }
}

function makeFakeResponse(nationalId: string, mobile: string) {
    const lastChar = nationalId.trim().slice(-1);
    const lastDigit = parseInt(lastChar, 10);

    const hasBankAccount = !Number.isNaN(lastDigit) ? (lastDigit % 2 === 0) : true;
    const verified = !Number.isNaN(lastDigit) ? (lastDigit % 3 === 0) : false;

    const verifiedFinal = (!Number.isNaN(lastDigit) && (lastDigit % 5 === 0)) ? false : verified;

    return {
        success: true,
        data: {
            nationalId,
            mobile,
            verified: verifiedFinal,
            hasBankAccount,
            firstName: 'علی',
            lastName: 'احمدی',
        }
    };
}

function makeRandomResponse(nationalId: string, mobile: string) {
    const pick = Math.random() < 0.5;

    if (pick) {
        return {
            success: true,
            data: {
                nationalId,
                mobile,
                verified: true,
                hasBankAccount: true,
                firstName: 'علی',
                lastName: 'احمدی',
            }
        };
    }

    return {
        success: true,
        data: {
            nationalId,
            mobile,
            verified: false,
            hasBankAccount: false,
            firstName: 'علی',
            lastName: 'احمدی',
        }
    };
}
