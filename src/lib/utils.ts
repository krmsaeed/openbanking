import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function convertPersianToEnglish(value: string): string {
    // پشتیبانی از ارقام فارسی (U+06F0..U+06F9) و عربی (U+0660..U+0669)
    let out = '';
    for (const ch of value) {
        const code = ch.charCodeAt(0);
        if (code >= 0x06F0 && code <= 0x06F9) {
            out += String.fromCharCode(code - 0x06F0 + 0x30);
        } else if (code >= 0x0660 && code <= 0x0669) {
            out += String.fromCharCode(code - 0x0660 + 0x30);
        } else {
            out += ch;
        }
    }
    return out;
}

export function debounce<T extends (...args: unknown[]) => void>(
    func: T,
    delay: number
): T {
    let timeoutId: NodeJS.Timeout;

    return ((...args: unknown[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
}
