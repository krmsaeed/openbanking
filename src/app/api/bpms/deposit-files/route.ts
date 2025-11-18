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

    if (typeof errorCode === 'number' && errorCode < 0) {
        // Initialize error catalog if needed
        await initErrorCatalog();
        // Try to get mapped message from error catalog
        const mappedMessage = getMessageByCode(errorCode);
        return mappedMessage || originalMessage;
    }

    return originalMessage;
}

async function handler(request: AuthenticatedRequest) {
    try {
        const data = await request.formData();
        const authToken = request.auth?.token;
        const response = await virtualOpenDepositKeKycUserFiles(data, authToken);

        if (response.status === 200) {
            const hasException =
                response.data &&
                typeof response.data === 'object' &&
                'digitalMessageException' in response.data;

            if (hasException) {
                const data = response.data;
                const exception = data.digitalMessageException;
                const mappedMessage = await mapExceptionMessage(exception);

                const errorResponse = {
                    ...response,
                    data: {
                        digitalMessageException: {
                            ...exception,
                            message: mappedMessage,
                        },
                    },
                };
                return NextResponse.json(errorResponse, { status: 400 });
            }

            return NextResponse.json({ ...(response.data || {}) }, { status: 200 });
        }
        return NextResponse.json({ data: response.data });
    } catch (error) {
        const axiosError = error as Record<string, unknown>;
        let errorMessage = 'خطای ارتباط با سرور';
        const statusCode = 500;

        if (axiosError.code === 'ECONNREFUSED') {
            errorMessage = 'سرور در دسترس نیست';
        } else if (axiosError.message && typeof axiosError.message === 'string') {
            if (axiosError.message.includes('ECONNREFUSED')) {
                errorMessage = 'سرور در دسترس نیست';
            } else if (axiosError.message.includes('timeout')) {
                errorMessage = 'درخواست timeout شد';
            }
        }

        return NextResponse.json(
            {
                digitalMessageException: {
                    errorCode: statusCode,
                    message: errorMessage,
                },
            },
            { status: statusCode }
        );
    }
}

export const POST = withAuth(handler);
