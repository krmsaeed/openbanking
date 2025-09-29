"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Box, Typography } from "../ui/core";
import { Input } from "../ui";


const convertToPersianDigits = (str: string): string => {
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    return str.replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
};

const convertToEnglishDigits = (str: string): string => {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    let result = str;

    for (let i = 0; i < persianNumbers.length; i++) {
        result = result.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
    }

    for (let i = 0; i < arabicNumbers.length; i++) {
        result = result.replace(new RegExp(arabicNumbers[i], 'g'), englishNumbers[i]);
    }

    return result;
};

interface PersianCalendarProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    icon?: React.ReactNode;
    maxDate?: Date;
    error?: string;
}


const PERSIAN_MONTHS = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];


const PERSIAN_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];


const isPersianLeapYear = (year: number): boolean => {
    const breaks = [-14, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81, 84, 87, 90, 93, 96, 99, 102, 105, 108, 111, 114, 117, 120, 123, 126, 129, 132, 135, 138, 141, 144, 147, 150, 153, 156, 159, 162, 165, 168, 171, 174, 177, 180, 183, 186, 189, 192, 195, 198, 201, 204, 207, 210, 213, 216, 219, 222, 225, 228, 231, 234, 237, 240, 243, 246, 249, 252, 255, 258, 261, 264, 267, 270, 273, 276, 279, 282, 285, 288, 291, 294, 297, 300];

    let leap = -14;
    let jp = breaks[0];

    let jump = 0;
    for (let j = 1; j <= breaks.length; j++) {
        const jm = breaks[j];
        jump = jm - jp;
        if (year < jm) break;
        leap = leap + 33 * Math.floor(jump / 33) + Math.floor((jump % 33) / 4);
        jp = jm;
    }
    const n = year - jp;

    if (n < jump) {
        leap = leap + Math.floor(n / 33) * 33 + Math.floor((n % 33 + 3) / 4);
        if ((jump % 33) === 4 && (jump - n) === 4) leap += 1;
    }

    return ((leap + 1) % 33) % 4 === 1;
};


const getPersianMonthDays = (year: number, month: number): number => {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    return isPersianLeapYear(year) ? 30 : 29;
};


const gregorianToPersian = (gYear: number, gMonth: number, gDay: number): [number, number, number] => {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = gYear <= 1600 ? 0 : 979;
    gYear -= gYear <= 1600 ? 621 : 1600;
    const gy2 = gMonth > 2 ? gYear + 1 : gYear;
    let days = (365 * gYear) + (Math.floor((gy2 + 3) / 4)) - (Math.floor((gy2 + 99) / 100)) + (Math.floor((gy2 + 399) / 400)) - 80 + gDay + g_d_m[gMonth - 1];
    jy += 33 * Math.floor(days / 12053);
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days >= 366) {
        jy += Math.floor((days - 1) / 365);
        days = (days - 1) % 365;
    }
    const jp = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
    const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
    return [jy, jp, jd];
};


const persianToGregorian = (jYear: number, jMonth: number, jDay: number): [number, number, number] => {
    let jy = jYear - 979;
    let jp = 0;
    for (let i = 0; i < jMonth; i++) {
        jp += getPersianMonthDays(jYear, i + 1);
    }
    jp += jDay - 1;

    let gy = 1600 + 400 * Math.floor(jy / 1029983);
    jy %= 1029983;

    if (jy >= 366) {
        jy -= 1;
        gy += Math.floor(jy / 365);
        jy = jy % 365;
    }

    jp += (365 * jy) + (Math.floor(jy / 33) * 8) + (Math.floor(((jy % 33) + 3) / 4));
    if ((jy % 33) % 4 !== 0 && (jy % 33) > 4) jp += Math.floor(((jy % 33) + 1) / 4);

    let gm = 0;
    let gd = 0;

    const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    for (let i = 0; i < 13; i++) {
        const v = i < 1 ? 0 : sal_a[i];
        if (jp < v) {
            break;
        }
        jp -= v;
        gm++;
    }
    gd = jp + 1;

    return [gy, gm, gd];
};


const getFirstDayOfPersianMonth = (year: number, month: number): number => {
    const [gy, gm, gd] = persianToGregorian(year, month, 1);
    const date = new Date(gy, gm - 1, gd);
    return (date.getDay() + 1) % 7;
};

export default function PersianCalendar({ value, onChange, placeholder, label, required, disabled, className, maxDate, error }: PersianCalendarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [displayValue, setDisplayValue] = useState(value || '');
    const [showMonthOverlay, setShowMonthOverlay] = useState(false);
    const [showYearOverlay, setShowYearOverlay] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);
    const yearListRef = useRef<HTMLDivElement | null>(null);
    const monthOverlayRef = useRef<HTMLDivElement | null>(null);
    const yearOverlayRef = useRef<HTMLDivElement | null>(null);
    const monthToggleRef = useRef<HTMLButtonElement | null>(null);
    const yearToggleRef = useRef<HTMLButtonElement | null>(null);

    const today = new Date();
    const [todayPersianYear, todayPersianMonth, todayPersianDay] = gregorianToPersian(today.getFullYear(), today.getMonth() + 1, today.getDate());

    const [currentYear, setCurrentYear] = useState(todayPersianYear);
    const [currentMonth, setCurrentMonth] = useState(todayPersianMonth);
    const [selectedDate, setSelectedDate] = useState<{ year: number, month: number, day: number } | null>(null);

    useEffect(() => {
        if (value) {
            const parts = value.split('/');
            if (parts.length === 3) {
                const year = parseInt(convertToEnglishDigits(parts[0]));
                const month = parseInt(convertToEnglishDigits(parts[1]));
                const day = parseInt(convertToEnglishDigits(parts[2]));
                if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                    setSelectedDate({ year, month, day });
                    setCurrentYear(year);
                    setCurrentMonth(month);
                }
            }
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (calendarRef.current && !calendarRef.current.contains(target)) {
                setIsOpen(false);
                setShowMonthOverlay(false);
                setShowYearOverlay(false);
                return;
            }


            if (showMonthOverlay) {
                const insideMonthOverlay = monthOverlayRef.current && monthOverlayRef.current.contains(target);
                const onMonthToggle = monthToggleRef.current && monthToggleRef.current.contains(target);
                if (!insideMonthOverlay && !onMonthToggle) {
                    setShowMonthOverlay(false);
                }
            }


            if (showYearOverlay) {
                const insideYearOverlay = yearOverlayRef.current && yearOverlayRef.current.contains(target);
                const onYearToggle = yearToggleRef.current && yearToggleRef.current.contains(target);
                if (!insideYearOverlay && !onYearToggle) {
                    setShowYearOverlay(false);
                }
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, showMonthOverlay, showYearOverlay]);


    const MIN_YEAR = 1300;
    const MAX_YEAR = 1450;

    useEffect(() => {
        if (showYearOverlay && yearListRef.current) {
            const node = yearListRef.current;
            const highlighted = (selectedDate?.year ?? currentYear);
            const clamped = Math.min(Math.max(highlighted, MIN_YEAR), MAX_YEAR);
            const index = clamped - MIN_YEAR;
            const child = node.children[index] as HTMLElement | undefined;
            if (child) {
                node.scrollTop = Math.max(0, child.offsetTop - node.clientHeight / 2 + child.clientHeight / 2);
            }
        }
    }, [showYearOverlay, currentYear, selectedDate]);

    const handleDateSelect = (day: number) => {
        const newDate = { year: currentYear, month: currentMonth, day };
        setSelectedDate(newDate);
        const formattedDate = `${convertToPersianDigits(currentYear.toString())}/${convertToPersianDigits(currentMonth.toString().padStart(2, '0'))}/${convertToPersianDigits(day.toString().padStart(2, '0'))}`;
        setDisplayValue(formattedDate);
        onChange?.(formattedDate);
        setIsOpen(false);
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        if (direction === 'next') {
            if (currentMonth === 12) {
                setCurrentMonth(1);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        } else {
            if (currentMonth === 1) {
                setCurrentMonth(12);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        }
    };

    const generateCalendarDays = () => {
        const daysInMonth = getPersianMonthDays(currentYear, currentMonth);
        const firstDay = getFirstDayOfPersianMonth(currentYear, currentMonth);
        const days = [];

        let maxPersianYear = Infinity, maxPersianMonth = Infinity, maxPersianDay = Infinity;
        if (maxDate) {
            const [mYear, mMonth, mDay] = gregorianToPersian(maxDate.getFullYear(), maxDate.getMonth() + 1, maxDate.getDate());
            maxPersianYear = mYear;
            maxPersianMonth = mMonth;
            maxPersianDay = mDay;
        }

        for (let i = 0; i < firstDay; i++) {
            days.push(<Box key={`empty-${i}`} className="h-8 w-8"></Box>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const isSelected = selectedDate?.year === currentYear &&
                selectedDate?.month === currentMonth &&
                selectedDate?.day === day;
            const isToday = currentYear === todayPersianYear && currentMonth === todayPersianMonth && day === todayPersianDay;

            let isDisabled = false;
            if (maxDate) {
                if (currentYear > maxPersianYear) isDisabled = true;
                else if (currentYear === maxPersianYear && currentMonth > maxPersianMonth) isDisabled = true;
                else if (currentYear === maxPersianYear && currentMonth === maxPersianMonth && day > maxPersianDay) isDisabled = true;
            }

            days.push(
                <button
                    type="button"
                    key={day}
                    onClick={() => !isDisabled && handleDateSelect(day)}
                    disabled={isDisabled}
                    className={`h-8 w-8 text-sm rounded-full flex items-center justify-center transition-colors ${isSelected
                        ? 'bg-secondary text-white'
                        : isToday
                            ? 'border border-secondary text-secondary'
                            : isDisabled
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'hover:bg-gray-100 text-gray-700'
                        }`}
                >
                    {convertToPersianDigits(day.toString())}
                </button>
            );
        }

        return days;
    };
    return (
        <Box className="relative" ref={calendarRef}>
            <Box className="mb-4">
                <Input
                    type="text"
                    label={label}
                    value={displayValue}
                    onClick={() => !disabled && setIsOpen(true)}
                    onChange={(e) => setDisplayValue(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={className}
                    error={error}
                    readOnly
                    required={required}
                    endAdornment={<CalendarIcon onClick={() => setIsOpen(true)} className="h-5 w-5 cursor-pointer" />}
                />
            </Box>
            {isOpen && (
                <Box className="p-4 absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-lg  z-50">
                    {/* Header */}
                    <Box className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => navigateMonth('prev')}
                            className=" rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                        </button>

                        <Box className="text-center my-4">
                            <div className="inline-flex items-center gap-2" >
                                <button
                                    type="button"
                                    ref={monthToggleRef}
                                    onClick={() => setShowMonthOverlay((s: boolean) => !s)}
                                    className="px-2 py-1 rounded-md border border-gray-200 bg-white"
                                    aria-haspopup="true"
                                    aria-expanded={showMonthOverlay}
                                >
                                    <Typography variant="body1" className="font-semibold text-gray-800">
                                        {PERSIAN_MONTHS[currentMonth - 1]}
                                    </Typography>
                                </button>

                                <button
                                    type="button"
                                    ref={yearToggleRef}
                                    onClick={() => setShowYearOverlay((s: boolean) => !s)}
                                    className="px-2 py-1 rounded-md border border-gray-200 bg-white"
                                    aria-haspopup="true"
                                    aria-expanded={showYearOverlay}
                                >
                                    <Typography variant="body1" className="font-semibold text-gray-800">
                                        {convertToPersianDigits(currentYear.toString())}
                                    </Typography>
                                </button>



                                {showMonthOverlay && (
                                    <div className="absolute z-50 top-16 right-0 mt-2 w-full flex justify-center ">
                                        <div ref={monthOverlayRef} className="bg-white border border-gray-200 rounded-lg shadow-lg p-3" style={{ width: 360, maxWidth: '90%' }}>
                                            <div className="grid grid-cols-3 gap-2">
                                                {PERSIAN_MONTHS.map((m, idx) => (
                                                    <button
                                                        type="button"
                                                        key={m}
                                                        onClick={() => { setCurrentMonth(idx + 1); setShowMonthOverlay(false); }}
                                                        className={`px-2 py-1 rounded ${currentMonth === idx + 1 ? 'bg-secondary text-white' : 'hover:bg-gray-100'}`}
                                                    >
                                                        {m}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {showYearOverlay && (
                                    <div className="absolute  top-16 right-0 z-50 mt-2 w-full flex justify-center">
                                        <div ref={yearOverlayRef} className="bg-white border border-gray-200 rounded-lg shadow-lg p-3" style={{ width: 240, maxWidth: '90%' }}>
                                            <div ref={yearListRef} className="h-56 overflow-auto pr-2  grid grid-cols-3 gap-4">
                                                {Array.from({ length: (MAX_YEAR - MIN_YEAR) + 1 }).map((_, i) => {
                                                    const y = MIN_YEAR + i;
                                                    const highlightedYear = selectedDate?.year ?? currentYear;
                                                    const isHighlighted = highlightedYear === y;
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={y}
                                                            onClick={() => { setCurrentYear(y); setShowYearOverlay(false); }}
                                                            className={`w-full text-right px-3 py-1 rounded ${isHighlighted ? 'bg-secondary text-white' : 'hover:bg-gray-50'}`}
                                                        >
                                                            {convertToPersianDigits(y.toString())}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Box>

                        <button
                            type="button"
                            onClick={() => navigateMonth('next')}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                        </button>
                    </Box>

                    <Box className="grid grid-cols-7 gap-1 mb-2">
                        {PERSIAN_DAYS.map((day, index) => (
                            <Box key={index} className="h-8 w-8 flex items-center justify-center text-xs font-medium text-gray-500">
                                {day}
                            </Box>
                        ))}
                    </Box>

                    <Box className="grid grid-cols-7 gap-1">
                        {generateCalendarDays()}
                    </Box>

                    <div className="mt-3 flex justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setCurrentYear(todayPersianYear);
                                setCurrentMonth(todayPersianMonth);
                                setSelectedDate({ year: todayPersianYear, month: todayPersianMonth, day: todayPersianDay });
                                const formattedDate = `${convertToPersianDigits(todayPersianYear.toString())}/${convertToPersianDigits(todayPersianMonth.toString().padStart(2, '0'))}/${convertToPersianDigits(todayPersianDay.toString().padStart(2, '0'))}`;
                                setDisplayValue(formattedDate);
                            }}
                            className="px-3 py-2 rounded-md border border-gray-200 bg-white text-sm"
                        >
                            امروز
                        </button>
                    </div>


                </Box>
            )}
        </Box>
    );
}
