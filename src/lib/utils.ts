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

export function removeCookie(name: string): void {
    if (typeof window === 'undefined') return;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function formatNumberWithCommas(num: number | string): string {
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(number)) return num.toString();
    return number.toLocaleString('en-US');
}

export function cleanNationalId(input: string): string {
    const normalized = convertPersianToEnglish(input || '');
    return normalized.replace(/\D/g, '').trim();
}

export function isValidNationalId(code: string): boolean {
    if (!code) return false;
    const v = cleanNationalId(code);
    if (v.length !== 10) return false;

    if (/^(\d)\1{9}$/.test(v)) return false;

    const digits = v.split('').map((d) => parseInt(d, 10));
    const check = digits[9];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += digits[i] * (10 - i);
    }
    const remainder = sum % 11;
    if (remainder < 2) return check === remainder;
    return check === 11 - remainder;
}
