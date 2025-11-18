import { getServerAuthTokens } from '@/lib/auth';
import { getMessageByCode } from '@/services/errorCatalog';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Check if response status is success (2xx or 3xx)
function isSuccessResponse(status: number) {
    return status >= 200 && status < 400;
}

// Helper function to create response with cleared cookies
function createResponseWithClearedCookies(data: unknown, status: number) {
    const headers = new Headers();
    headers.append('Set-Cookie', 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    headers.append('Set-Cookie', 'token_expiry=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    headers.append('Set-Cookie', 'national_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');

    return new NextResponse(JSON.stringify(data), {
        status,
        headers,
    });
}

export async function GET(request: NextRequest) {
    const { accessToken } = getServerAuthTokens(request);

    if (!accessToken) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const response = await fetch(`${process.env.BASE_URL}/bpms/register`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();

        if (!isSuccessResponse(response.status)) {
            return createResponseWithClearedCookies(data, response.status);
        }

        // Check for digitalMessageException in successful responses
        const hasException = data && typeof data === 'object' && 'digitalMessageException' in data;

        if (hasException) {
            const exception = data.digitalMessageException as { code: number; message: string };
            const mappedMessage =
                typeof exception.code === 'number' && exception.code < 0
                    ? getMessageByCode(exception.code) || exception.message
                    : exception.message;

            // Ensure message is a string
            const finalMessage =
                typeof mappedMessage === 'string' ? mappedMessage : JSON.stringify(mappedMessage);

            const errorData = {
                ...data,
                digitalMessageException: {
                    ...exception,
                    message: finalMessage,
                },
            };
            return createResponseWithClearedCookies(errorData, 400);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Register API error:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function POST(request: NextRequest) {
    const { accessToken } = getServerAuthTokens(request);

    if (!accessToken) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const body = await request.json();

        const response = await fetch(`${process.env.BASE_URL}/bpms/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!isSuccessResponse(response.status)) {
            return createResponseWithClearedCookies(data, response.status);
        }

        // Check for digitalMessageException in successful responses
        const hasException = data && typeof data === 'object' && 'digitalMessageException' in data;

        if (hasException) {
            const exception = data.digitalMessageException as { code: number; message: string };
            const mappedMessage =
                typeof exception.code === 'number' && exception.code < 0
                    ? getMessageByCode(exception.code) || exception.message
                    : exception.message;

            // Ensure message is a string
            const finalMessage =
                typeof mappedMessage === 'string' ? mappedMessage : JSON.stringify(mappedMessage);

            const errorData = {
                ...data,
                digitalMessageException: {
                    ...exception,
                    message: finalMessage,
                },
            };
            return createResponseWithClearedCookies(errorData, 400);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Register API error:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
