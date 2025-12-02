import { withAuth, type AuthenticatedRequest } from '@/lib/authMiddleware';
import { virtualOpenDepositKeKycUserFiles } from '@/services/bpms';
import { NextResponse } from 'next/server';

async function handler(request: AuthenticatedRequest) {
    try {
        const data = await request.formData();
        const authToken = request.auth?.token;
        const response = await virtualOpenDepositKeKycUserFiles(data, authToken);
        console.log('BPMS File Upload Response:', response);
        if (response.status === 200) {
            const hasException =
                response.data &&
                typeof response.data === 'object' &&
                'digitalMessageException' in response.data;

            if (hasException) {
                const exception = response.data.digitalMessageException;
                const errorResponse = {
                    status: 400,
                    ...response.data,
                    digitalMessageException: {
                        code: exception.code || exception.errorCode,
                        errorKey: exception.errorKey,
                        message: exception.message,
                    },
                };
                return NextResponse.json(errorResponse, { status: 400 });
            }

            return NextResponse.json({ ...(response.data || {}) }, { status: 200 });
        }
        return NextResponse.json({ data: response.data });
    } catch (error) {
        const errorData = error && typeof error === 'object' && 'response' in error
            ? error?.response
            : undefined;
        return NextResponse.json(
            {
                errorData,
                digitalMessageException: {
                    errorCode: 500,
                    message: 'عدم برقراری ارتباط با سرور',
                },
            },
            { status: 500 }
        );
    }
}

export const POST = withAuth(handler);
