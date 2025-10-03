import { cn } from "@/lib/utils";
import { XCircleIcon } from "@heroicons/react/24/solid";
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import CustomInput from "./Input";

export interface OptionItem {
    value: string;
    label: React.ReactNode;
}

interface AutocompleteProps {
    label?: string;
    id?: string;
    options?: OptionItem[];
    placeholder?: string;
    value?: string | null;
    onValueChange?: (value: string | null) => void;
    onSearch?: (query: string) => Promise<OptionItem[]> | void;
    allowClear?: boolean;
    debounceMs?: number;
    className?: string;
    disabled?: boolean;
    error?: string;
    required?: boolean;
    fullWidth?: boolean;
}

const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(
    ({ className, label, id, options = [], placeholder, value = null, onValueChange, allowClear = true, onSearch, debounceMs: propDebounceMs, disabled, error, required, fullWidth, ...props }, ref) => {
        const [isOpen, setIsOpen] = useState(false);
        const [query, setQuery] = useState('');
        const [debouncedQuery, setDebouncedQuery] = useState('');
        const [highlight, setHighlight] = useState<number>(-1);
        const containerRef = useRef<HTMLDivElement | null>(null);
        const inputRef = useRef<HTMLInputElement | null>(null);
        const [asyncOptions, setAsyncOptions] = useState<OptionItem[] | null>(null);
        const [loading, setLoading] = useState(false);
        const reqIdRef = useRef(0);
        const [localSelectedLabel, setLocalSelectedLabel] = useState<React.ReactNode | null>(null);

        const actualDebounceMs = typeof propDebounceMs === 'number' ? propDebounceMs : 300;
        
        useEffect(() => {
            const t = setTimeout(() => setDebouncedQuery(query), actualDebounceMs);
            return () => clearTimeout(t);
        }, [query, actualDebounceMs]);

        useEffect(() => {
            let mounted = true;
            if (typeof onSearch === 'function') {
                const id = ++reqIdRef.current;
                setLoading(true);
                Promise.resolve(onSearch(debouncedQuery)).then((res) => {
                    if (!mounted) return;
                    if (id !== reqIdRef.current) return;
                    if (Array.isArray(res)) {
                        setAsyncOptions(res);
                    }
                    setLoading(false);
                }).catch(() => {
                    if (id === reqIdRef.current) setLoading(false);
                });
            } else {
                setAsyncOptions(null);
            }
            return () => { mounted = false; };
        }, [debouncedQuery, onSearch]);

        const currentOptions = asyncOptions ?? options;
        const selectedFromCurrent = useMemo(() => currentOptions.find((o) => o.value === value)?.label ?? '', [currentOptions, value]);
        const effectiveLabel = localSelectedLabel ?? selectedFromCurrent;
        const selectedText = typeof effectiveLabel === 'string' || typeof effectiveLabel === 'number' ? String(effectiveLabel) : '';
        const hasNodeLabel = !!effectiveLabel && !selectedText;

        const filtered = useMemo(() => {
            const q = debouncedQuery.trim().toLowerCase();
            if (!q) return currentOptions;
            return currentOptions.filter((o) => String(o.label).toLowerCase().includes(q) || o.value.toLowerCase().includes(q));
        }, [currentOptions, debouncedQuery]);

        useEffect(() => {
            const onClick = (e: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                    setIsOpen(false);
                    setHighlight(-1);
                }
            };
            document.addEventListener('click', onClick);
            return () => document.removeEventListener('click', onClick);
        }, []);

        useEffect(() => {
            if (!isOpen) return;
            setHighlight((h) => Math.max(-1, Math.min(h, filtered.length - 1)));
        }, [filtered, isOpen]);

        const open = useCallback(() => { setIsOpen(true); setHighlight(-1); }, []);
        const close = useCallback(() => { setIsOpen(false); setHighlight(-1); }, []);

        const selectValue = useCallback((val: string) => {
            onValueChange?.(val);
            const sel = currentOptions.find((o) => o.value === val);
            if (sel) setLocalSelectedLabel(sel.label);
            setQuery('');
            setDebouncedQuery('');
            close();
        }, [onValueChange, currentOptions, close]);

        const clearValue = useCallback(() => {
            setQuery(''); 
            onValueChange?.(null);
            setLocalSelectedLabel(null);
        }, [onValueChange]);

        useEffect(() => {
            setLocalSelectedLabel(null);
        }, [value]);

        const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setIsOpen(true);
                setHighlight((h) => Math.min(filtered.length - 1, h + 1));
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlight((h) => Math.max(-1, h - 1));
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                if (isOpen) {
                    const item = filtered[highlight >= 0 ? highlight : 0];
                    if (item) selectValue(item.value);
                } else {
                    setIsOpen(true);
                }
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                close();
                return;
            }
        };

        const listboxId = `autocomplete-listbox-${id || 'default'}`;
        const inputValue = isOpen ? query : selectedText;

        return (
            <div ref={containerRef} className={cn('relative', className)} role="combobox" aria-expanded={isOpen} aria-controls={listboxId} aria-haspopup="listbox">
                <CustomInput
                    ref={ref || inputRef}
                    id={id}
                    label={label}
                    placeholder={isOpen ? 'جستجو...' : (!value ? placeholder || 'انتخاب کنید...' : '')}
                    value={inputValue}
                    onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                    onFocus={open}
                    onClick={open}
                    onKeyDown={onKeyDown}
                    disabled={disabled}
                    error={error}
                    required={required}
                    fullWidth={fullWidth}
                    aria-autocomplete="list"
                    aria-controls={listboxId}
                    endAdornment={
                        allowClear && value ? (
                            <button 
                                type="button"
                                aria-label="clear" 
                                onClick={clearValue} 
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <XCircleIcon className="w-4 h-4" />
                            </button>
                        ) : undefined
                    }
                    {...props}
                />
                
                {/* If selected label is a ReactNode (not plain string), show it when closed */}
                {!isOpen && hasNodeLabel && (
                    <div className="pointer-events-none absolute top-8 right-8 flex items-center text-sm text-gray-700 dark:text-gray-300">{effectiveLabel}</div>
                )}

                {isOpen && (
                    <ul id={listboxId} role="listbox" className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-xl border bg-white dark:bg-gray-800 py-1 shadow-lg border-gray-200 dark:border-gray-700" tabIndex={-1}>
                        {loading && (
                            <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">در حال جستجو...</li>
                        )}
                        {!loading && filtered.length === 0 && (
                            <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">هیچ موردی یافت نشد</li>
                        )}
                        {filtered.map((o, idx) => (
                            <li
                                key={o.value}
                                role="option"
                                aria-selected={value === o.value}
                                className={cn('cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700', {
                                    'bg-primary/10 dark:bg-primary/20': idx === highlight,
                                    'bg-primary/5 dark:bg-primary/10': value === o.value,
                                })}
                                onMouseEnter={() => setHighlight(idx)}
                                onMouseDown={(e) => { e.preventDefault(); selectValue(o.value); }}
                            >
                                {o.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }
);

Autocomplete.displayName = "Autocomplete";

export { Autocomplete };
export default Autocomplete;