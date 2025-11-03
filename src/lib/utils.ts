import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default clsx;

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function convertPersianToEnglish(value: string): string {
    let out = '';
    for (const ch of value) {
        const code = ch.charCodeAt(0);
        if (code >= 0x06f0 && code <= 0x06f9) {
            out += String.fromCharCode(code - 0x06f0 + 0x30);
        } else if (code >= 0x0660 && code <= 0x0669) {
            out += String.fromCharCode(code - 0x0660 + 0x30);
        } else {
            out += ch;
        }
    }
    return out;
}

export function setCookie(name: string, value: string, days: number = 365): void {
    if (typeof window === 'undefined') return;
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
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

export function formatNumberWithCommas(num: number | string): string {
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(number)) return num.toString();
    return number.toLocaleString('en-US');
}

// ذخیره و بازیابی state از کوکی
export function saveUserStateToCookie(state: {
    step?: number;
    processId?: number | null;
    isCustomer?: boolean;
    isDeposit?: boolean;
}): void {
    if (state.step !== undefined) setCookie('user_step', String(state.step));
    if (state.processId !== undefined && state.processId !== null) {
        setCookie('process_id', String(state.processId));
    }
    if (state.isCustomer !== undefined) setCookie('is_customer', String(state.isCustomer));
    if (state.isDeposit !== undefined) setCookie('is_deposit', String(state.isDeposit));
}

export function getUserStateFromCookie(): {
    step: number | null;
    processId: number | null;
    isCustomer: boolean | null;
    isDeposit: boolean | null;
} {
    const step = getCookie('user_step');
    const processId = getCookie('process_id');
    const isCustomer = getCookie('is_customer');
    const isDeposit = getCookie('is_deposit');

    return {
        step: step ? parseInt(step, 10) : null,
        processId: processId ? parseInt(processId, 10) : null,
        isCustomer: isCustomer === 'true' ? true : isCustomer === 'false' ? false : null,
        isDeposit: isDeposit === 'true' ? true : isDeposit === 'false' ? false : null,
    };
}

export function clearUserStateCookies(): void {
    removeCookie([
        'user_step',
        'process_id',
        'is_customer',
        'is_deposit',
        'national_id',
        'access_token',
    ]);
}

export function cleanNationalId(code: string): string {
    if (!code) return '';
    const persian = '۰۱۲۳۴۵۶۷۸۹';
    const arabic = '٠١٢٣٤٥٦٧٨٩';
    return code
        .split('')
        .map((ch) => {
            const p = persian.indexOf(ch);
            if (p > -1) return String(p);
            const a = arabic.indexOf(ch);
            if (a > -1) return String(a);
            return ch;
        })
        .join('')
        .replace(/\D/g, '');
}

export function isValidNationalId(code: string): boolean {
    const v = cleanNationalId(code);
    if (!v || v.length !== 10) return false;

    if (/^(\d)\1{9}$/.test(v)) return false;

    const digits = v.split('').map((d) => parseInt(d, 10));
    const check = digits[9];

    let sumNew = 0;
    for (let i = 0; i < 9; i++) {
        sumNew += digits[i] * (10 - i);
    }
    const remainderNew = sumNew % 11;
    const expectedNew = remainderNew < 2 ? remainderNew : 11 - remainderNew;
    const validNew = check === expectedNew;

    let sumOld = 0;
    for (let i = 0; i < 9; i++) {
        sumOld += digits[i] * (i + 2);
    }
    const remainderOld = sumOld % 11;
    const validOld = check === remainderOld;

    return validNew || validOld;
}
