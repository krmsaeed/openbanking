/**
 * String utility functions for Persian and English text conversion
 */

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

export function formatNumberWithCommas(num: number | string): string {
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(number)) return num.toString();
    return number.toLocaleString('en-US');
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
