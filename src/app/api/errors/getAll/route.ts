import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

export async function GET() {
    try {
        const base = process.env.BASE_URL;
        const url = `${process.env.BASE_URL}/errors/getAll`;

        console.log('Fetching from:', url);

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        const response = await axios.get(url, {
            headers,
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