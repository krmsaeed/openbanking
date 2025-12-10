/**
 * Common utility functions (Tailwind class merging, etc)
 */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default clsx;

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
