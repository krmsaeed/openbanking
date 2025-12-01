import { withAuth, type AuthenticatedRequest } from '@/lib/authMiddleware';
import { virtualOpenDepositKeKycUserFiles } from '@/services/bpms';
import { getMessageByCode, initErrorCatalog } from '@/services/errorCatalog';
import { NextResponse } from 'next/server';

/**
 * Maps error message from exception using error catalog
 * If errorCode is negative, attempts to fetch mapped message from error catalog
 * Falls back to original message if mapping fails
 */
async function mapExceptionMessage(exception: Record<string, unknown>): Promise<string> {
    const errorCode = (exception.code as number) || (exception.errorCode as number);
    const originalMessage = exception.message as string;

    await initErrorCatalog();
    const mappedMessage = getMessageByCode(errorCode);
    return mappedMessage || originalMessage;

}

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
                const data = response.data;
                const exception = data.digitalMessageException;
                const mappedMessage = await mapExceptionMessage(exception);
                const isKnownError = mappedMessage !== (exception.message as string);

                const errorResponse = {
                    status: 200,
                    data: {
                        digitalMessageException: {
                            code: exception.code || exception.errorCode,
                            message: isKnownError ? mappedMessage : 'عدم برقراری ارتباط با سرور'
                        }
                    }
                };
                return NextResponse.json(errorResponse, { status: isKnownError ? 400 : 500 });
            }

            return NextResponse.json({ ...(response.data || {}) }, { status: 200 });
        }
        return NextResponse.json({ data: response.data });
    } catch (error) {
        console.error('Error in BPMS File Upload Handler:', error);
        return NextResponse.json(
            {
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
