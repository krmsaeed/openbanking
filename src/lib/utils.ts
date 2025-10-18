import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
const mergeClasses = clsx;
export default mergeClasses;

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

export const convertToEnglishNumbers = (value: string): string => {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    let result = value;

    for (let i = 0; i < persianNumbers.length; i++) {
        result = result.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
    }

    for (let i = 0; i < arabicNumbers.length; i++) {
        result = result.replace(new RegExp(arabicNumbers[i], 'g'), englishNumbers[i]);
    }

    return result;
};

export const convertToEnglishDigits = convertToEnglishNumbers;

export const convertToPersianDigits = (str: string): string => {
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    return str.replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
};

export const isOnlyEnglishNumbers = (value: string): boolean => {
    return /^[0-9]*$/.test(value);
};

export const normalizeNumbers = (value: string): string => {
    if (!value) return value;

    if (isOnlyEnglishNumbers(value)) {
        return value;
    }

    return convertToEnglishNumbers(value);
};

export function debounce<T extends (...args: unknown[]) => void>(func: T, delay: number): T {
    let timeoutId: NodeJS.Timeout;

    return ((...args: unknown[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
}

export function setCookie(name: string, value: string, days: number = 365): void {
    if (typeof window === 'undefined') return;
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value}; path=/; secure; samesite=strict; max-age=${maxAge}`;
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
