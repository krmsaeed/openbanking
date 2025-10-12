import { useEffect, useRef, useState } from 'react';

export function useSignatureStep() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const globalMoveRef = useRef<((e: MouseEvent | TouchEvent) => void) | null>(null);
    const globalUpRef = useRef<(() => void) | null>(null);
    const startPosRef = useRef<{ x: number; y: number } | null>(null);
    const movedRef = useRef(false);

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
            ctx.lineWidth = 4;
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

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        setIsDrawing(true);
        setHasSignature(true);
        movedRef.current = false;
        startPosRef.current = { x, y };

        ctx.beginPath();
        ctx.moveTo(x, y);

        globalMoveRef.current = (ev: MouseEvent | TouchEvent) => {
            if (!canvasRef.current) return;
            const c = canvasRef.current;
            const r = c.getBoundingClientRect();
            const clientX = 'touches' in ev ? ev.touches[0].clientX : (ev as MouseEvent).clientX;
            const clientY = 'touches' in ev ? ev.touches[0].clientY : (ev as MouseEvent).clientY;
            const nx = clientX - r.left;
            const ny = clientY - r.top;
            movedRef.current = true;
            const gctx = c.getContext('2d');
            if (!gctx) return;
            gctx.lineTo(nx, ny);
            gctx.stroke();
        };

        const finish = () => {
            const c = canvasRef.current;
            if (!c) return;
            const ctx = c.getContext('2d');
            if (!ctx) return;

            if (!movedRef.current && startPosRef.current) {
                const { x: sx, y: sy } = startPosRef.current;

                ctx.beginPath();
                ctx.arc(sx, sy, 2, 0, Math.PI * 2);
                ctx.fillStyle = ctx.strokeStyle || '#1f2937';
                ctx.fill();
            } else {
                ctx.closePath();
            }

            setIsDrawing(false);

            startPosRef.current = null;
            if (globalMoveRef.current) {
                window.removeEventListener('mousemove', globalMoveRef.current as EventListener);
                window.removeEventListener('touchmove', globalMoveRef.current as EventListener);
            }
            window.removeEventListener('mouseup', finish as EventListener);
            window.removeEventListener('touchend', finish as EventListener);
            globalMoveRef.current = null;
            globalUpRef.current = null;
        };

        globalUpRef.current = finish;

        window.addEventListener('mousemove', globalMoveRef.current as EventListener);
        window.addEventListener('mouseup', globalUpRef.current as EventListener);
        window.addEventListener(
            'touchmove',
            globalMoveRef.current as EventListener,
            { passive: false } as AddEventListenerOptions
        );
        window.addEventListener('touchend', globalUpRef.current as EventListener);
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

        movedRef.current = true;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (globalUpRef.current) {
            globalUpRef.current();
        } else {
            setIsDrawing(false);
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
        setHasSignature(false);
    };

    return {
        canvasRef,
        isDrawing,
        hasSignature,
        startDrawing,
        draw,
        stopDrawing,
        clearSignature,
    };
}
