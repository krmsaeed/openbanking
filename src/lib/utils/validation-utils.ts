/**
 * Validation utility functions for national ID and form validation
 */
import { cleanNationalId } from './string-utils';

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
