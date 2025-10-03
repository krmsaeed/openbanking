import { useRef, useEffect, useCallback } from 'react';

export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
    callback: T,
    delay: number
) {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cbRef = useRef(callback);

    useEffect(() => {
        cbRef.current = callback;
    }, [callback]);

    const debounced = useCallback(
        (...args: Parameters<T>) => {
            if (timer.current) {
                clearTimeout(timer.current);
            }
            timer.current = setTimeout(() => {
                cbRef.current(...args);
            }, delay);
        },
        [delay]
    );

    const cancel = useCallback(() => {
        if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
        }
    }, []);

    useEffect(() => {
        return () => cancel();
    }, [cancel]);

    return [debounced, cancel] as const;
}
