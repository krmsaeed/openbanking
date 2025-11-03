import { getCookie, removeCookie, setCookie } from './utils';

export interface AuthTokens {
    accessToken: string;
    expiresIn?: number;
}

export interface InitialAuthData {
    token: string;
    nationalId: string;
}

const ACCESS_TOKEN_KEY = 'access_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';
const NATIONAL_ID_KEY = 'national_id';

export function saveAuthTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;

    try {
        setCookie(ACCESS_TOKEN_KEY, tokens.accessToken, 1);

        if (tokens.expiresIn) {
            const expiryTime = Date.now() + tokens.expiresIn * 1000;
            setCookie(TOKEN_EXPIRY_KEY, expiryTime.toString(), 1);
        }
    } catch (error) {
        console.error('Failed to save auth tokens:', error);
    }
}

export function getAccessToken(): string | null {
    try {
        return getCookie(ACCESS_TOKEN_KEY);
    } catch (error) {
        console.error('Failed to get access token:', error);
        return null;
    }
}

export function isTokenExpired(): boolean {
    try {
        const expiryTime = getCookie(TOKEN_EXPIRY_KEY);
        if (!expiryTime) return false;
        return Date.now() >= parseInt(expiryTime, 10);
    } catch (error) {
        console.error('Failed to check token expiry:', error);
        return true;
    }
}

export function verifyToken(token: string): boolean {
    try {
        if (!token) return false;
        return !isTokenExpired();
    } catch (error) {
        console.error('Failed to verify token:', error);
        return false;
    }
}

// Auth helper class
export const auth = {
    verifyToken,
    getAccessToken,
    isTokenExpired,
    saveAuthTokens,
    clearAuthTokens,
    initializeAuth,
    getServerAuthTokens,
};
export function saveNationalId(nationalId: string): void {
    try {
        setCookie(NATIONAL_ID_KEY, nationalId, 1);
    } catch (error) {
        console.error('Failed to save national ID:', error);
    }
}

export function getNationalId(): string | null {
    try {
        return getCookie(NATIONAL_ID_KEY);
    } catch (error) {
        console.error('Failed to get national ID:', error);
        return null;
    }
}

export function clearAuthTokens(): void {
    try {
        removeCookie([ACCESS_TOKEN_KEY, TOKEN_EXPIRY_KEY, NATIONAL_ID_KEY]);
    } catch (error) {
        console.error('Failed to clear auth tokens:', error);
    }
}

export function initializeAuth(authData: InitialAuthData): void {
    saveAuthTokens({ accessToken: authData.token });
    saveNationalId(authData.nationalId);
}

export function getServerAuthTokens(request: Request): {
    accessToken: string | null;
    nationalId: string | null;
} {
    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || null;

    const cookies = request.headers.get('cookie') || '';
    const cookieTokenMatch = cookies.match(/access_token=([^;]+)/);
    const cookieToken = cookieTokenMatch?.[1] || null;

    const nationalIdMatch = cookies.match(/national_id=([^;]+)/);
    const nationalId = nationalIdMatch?.[1] || null;

    return {
        accessToken: accessToken || cookieToken,
        nationalId,
    };
}
