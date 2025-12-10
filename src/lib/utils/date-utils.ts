/**
 * Date utility functions for Persian date conversion
 */
import { digitsEnToFa } from '@persian-tools/persian-tools';

export function toPersianDate(dateString?: string): string {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        // Convert to Persian date using Persian tools
        const persianDate = new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);

        return digitsEnToFa(persianDate);
    } catch (error) {
        console.error('Error converting date to Persian:', error);
        return 'نامشخص';
    }
}
