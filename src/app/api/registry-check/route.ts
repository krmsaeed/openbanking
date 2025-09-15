import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { nationalId } = await request.json()

        if (!nationalId) {
            return NextResponse.json(
                { error: 'کد ملی الزامی است' },
                { status: 400 }
            )
        }

        const mockResponse = {
            isValid: true,
            firstName: 'علی',
            lastName: 'احمدی',
            birthDate: '1370/05/15',
            fatherName: 'حسن'
        }

        return NextResponse.json({
            success: true,
            data: mockResponse
        })
    } catch (error) {
        console.error('Registry check error:', error)
        return NextResponse.json(
            { error: 'خطا در پردازش درخواست' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Registry Check API is running',
        status: 'active'
    })
}
