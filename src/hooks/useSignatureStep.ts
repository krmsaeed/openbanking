import { useUser } from '@/contexts/UserContext';
import { convertToFile, createBPMSFormData } from '@/lib/fileUtils';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export function useSignatureStep() {
    const { userData, setUserData } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(2, 2);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 3;
        }
    }, []);

    const startDrawing = (
        e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
    ) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        setHasSignature(true);

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
        setHasSignature(false);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        const canvas = canvasRef.current;
        if (!canvas || !hasSignature) {
            setIsLoading(false);
            return;
        }

        try {
            const file = await convertToFile(canvas, 'signature', 'image/png', 1.0);

            if (!file) {
                toast.error('امکان ایجاد تصویر امضا وجود ندارد');
                setIsLoading(false);
                return;
            }

            const formData = createBPMSFormData(
                file,
                'virtual-open-deposit',
                userData.processId,
                'VideoInquiry'
            );

            const response = await axios.post('/api/bpms/deposit-files', formData);
            const { data } = response.data;

            if (data.body.success) {
                setUserData({ ...userData, step: 5 });
            }
        } catch (error) {
            console.error('Signature upload error:', error);
            toast.error('آپلود امضا با مشکل مواجه شد');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        canvasRef,
        isLoading,
        isDrawing,
        hasSignature,
        startDrawing,
        draw,
        stopDrawing,
        clearSignature,
        handleSubmit,
    };
}
