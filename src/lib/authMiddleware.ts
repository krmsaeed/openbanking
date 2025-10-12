import { getServerAuthTokens } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export interface AuthenticatedRequest extends NextRequest {
    auth?: {
        token: string;
        nationalId: string;
    };
}
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
    return async (req: NextRequest): Promise<NextResponse> => {
        try {
            const { accessToken, nationalId } = getServerAuthTokens(req);

            if (!accessToken || !nationalId) {
                return NextResponse.json(
                    { error: 'Missing authentication credentials' },
                    { status: 401 }
                );
            }

            const authenticatedReq = req as AuthenticatedRequest;
            authenticatedReq.auth = {
                token: accessToken,
                nationalId: nationalId,
            };

            return handler(authenticatedReq);
        } catch (error) {
            console.error('Authentication middleware error:', error);
            return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
        }
    };
}

export function isValidToken(token: string): boolean {
    return !!(token && token.length > 10 && typeof token === 'string');
}

export function isValidNationalIdFormat(nationalId: string): boolean {
    const cleanNationalId = nationalId.replace(/\D/g, '');
    return cleanNationalId.length === 10;
}
