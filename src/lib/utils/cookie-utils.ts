/**
 * Cookie utility functions for persistent state management
 */

export function setCookie(name: string, value: string, days: number = 365): void {
    if (typeof window === 'undefined') return;
    const maxAge = days * 24 * 60 * 60;
    const isSecure = window.location.protocol === 'https:';
    const secureFlag = isSecure ? '; Secure' : '';
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
}

export function getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null;
    const cookieMatch = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return cookieMatch ? cookieMatch[1] : null;
}

export function removeCookie([...name]): void {
    if (typeof window === 'undefined') return;
    for (const n of name) {
        document.cookie = `${n}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
}

// ذخیره و بازیابی state از کوکی
export function saveUserStateToCookie(state: {
    step?: number;
    processId?: number | null;
    isCustomer?: boolean;
    isDeposit?: boolean;
    randomText?: string | null;
}): void {
    if (state.step !== undefined) setCookie('user_step', String(state.step));
    if (state.processId !== undefined && state.processId !== null) {
        setCookie('process_id', String(state.processId));
    }
    if (state.isCustomer !== undefined) setCookie('is_customer', String(state.isCustomer));
    if (state.isDeposit !== undefined) setCookie('is_deposit', String(state.isDeposit));
    if (state.randomText !== undefined && state.randomText !== null) {
        setCookie('random_text', state.randomText);
    }
}

export function getUserStateFromCookie(): {
    step: number | null;
    processId: number | null;
    isCustomer: boolean | null;
    isDeposit: boolean | null;
    randomText: string | null;
} {
    const step = getCookie('user_step');
    const processId = getCookie('process_id');
    const isCustomer = getCookie('is_customer');
    const isDeposit = getCookie('is_deposit');
    const randomText = getCookie('random_text');

    return {
        step: step ? parseInt(step, 10) : null,
        processId: processId ? parseInt(processId, 10) : null,
        isCustomer: isCustomer === 'true' ? true : isCustomer === 'false' ? false : null,
        isDeposit: isDeposit === 'true' ? true : isDeposit === 'false' ? false : null,
        randomText: randomText || null,
    };
}

export function clearUserStateCookies(): void {
    removeCookie([
        'user_step',
        'process_id',
        'is_customer',
        'is_deposit',
        'national_id',
        'random_text',
        'access_token',
    ]);
}
