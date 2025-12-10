'use client';

import React, { ReactNode } from 'react';
import { Box, Typography } from '@/components/ui';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class VideoErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('خطا در پردازش دوربین:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <Box className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-6">
                        <Typography variant="h6" className="mb-2 text-red-700">
                            خطا در فیلم‌برداری
                        </Typography>
                        <Typography variant="body2" className="text-center text-red-600">
                            {this.state.error?.message ||
                                'خطایی در بارگذاری دوربین اتفاق افتاد. لطفاً صفحه را رفریش کنید.'}
                        </Typography>
                    </Box>
                )
            );
        }

        return this.props.children;
    }
}

export default VideoErrorBoundary;
