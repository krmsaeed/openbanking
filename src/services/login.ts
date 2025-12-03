import { httpClient } from '@/lib/httpClient';

export async function virtualOpenDepositLogin(formData: Record<string, string>) {
    const body = new URLSearchParams(formData);
    const response = await httpClient.post('/api/bpms/login', body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
}