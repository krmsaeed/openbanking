'use client';

import dynamic from 'next/dynamic';

const ThemeToggle = dynamic(() => import('@/components/ui/ThemeToggle'), {
    ssr: false,
    loading: () => null,
});

export default ThemeToggle;
