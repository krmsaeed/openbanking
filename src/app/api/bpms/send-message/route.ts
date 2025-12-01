import { withAuth, type AuthenticatedRequest } from '@/lib/authMiddleware';
import { virtualOpenDepositSendMessage } from '@/services/bpms';
import { getMessageByCode, initErrorCatalog } from '@/services/errorCatalog';
import { NextResponse } from 'next/server';

async function mapExceptionMessage(exception: Record<string, unknown>): Promise<string> {
    const errorCode = (exception.code as number) || (exception.errorCode as number);
    const originalMessage = exception.message as string;

    if (typeof errorCode === 'number' && errorCode < 0) {
        await initErrorCatalog();
        const mappedMessage = getMessageByCode(errorCode);
        return mappedMessage || originalMessage;
    }

    return originalMessage;
}

async function handler(request: AuthenticatedRequest) {
    try {
        const body = await request.json();

        const requestBody = {
            ...body,
        };
        const authToken = request.auth?.token;
        const response = await virtualOpenDepositSendMessage(requestBody, authToken);

        if (response.status === 200) {
            const hasException =
                response.data &&
                typeof response.data === 'object' &&
                'digitalMessageException' in response.data;

            if (hasException) {
                const data = response.data;
                const exception = data.digitalMessageException;
                const mappedMessage = await mapExceptionMessage(exception);
                const isKnownError = mappedMessage !== 'خطا در پردازش اطلاعات';
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

        return NextResponse.json({ error: response }, { status: response.status || 400 });
    } catch {
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
