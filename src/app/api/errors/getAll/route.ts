import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

export async function GET() {
    try {
        const base = process.env.BASE_URL?.replace(/\/$/, '');
        if (!base) {
            return NextResponse.json({ error: 'BASE_URL is not configured' }, { status: 500 });
        }

        const url = `${base}/errors/getAll`;
        const response = await axios.get(url, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000,
        });

        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error fetching errors:', error);
        if (error instanceof AxiosError) {
            return NextResponse.json({ error: 'Failed to fetch errors' }, { status: error.response?.status || 500 });
        } else {
            return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
        }
    }
}