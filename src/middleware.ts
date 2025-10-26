import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from './lib/auth';

export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/register')) {
        const token = request.cookies.get('access_token');

        if (!token?.value) {
            console.log('No token found, redirecting to home page');
            return NextResponse.redirect(new URL('/', request.url));
        }

        try {
            const isValid = auth.verifyToken(token.value);
            if (!isValid) {
                console.log('Invalid token, redirecting to home page');
                const response = NextResponse.redirect(new URL('/', request.url));
                response.cookies.delete('access_token');
                response.cookies.delete('token_expiry');
                response.cookies.delete('national_id');
                return response;
            }
        } catch {
            // در صورت خطا در بررسی توکن
            console.log('Error verifying token, redirecting to home page');
            const response = NextResponse.redirect(new URL('/', request.url));
            response.cookies.delete('access_token');
            response.cookies.delete('token_expiry');
            response.cookies.delete('national_id');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/register/:path*'],
};
