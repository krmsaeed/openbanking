"use client";

import { useState } from "react";
import { Input } from "./Input";

interface PersianDatePickerProps {
    label: string;
    placeholder?: string;
    value?: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
}

const persianMonths = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
];

const getDaysInMonth = (month: number, year: number): number => {
    if (month <= 6) return 31;
    if (month <= 11) return 30;

    const isLeapYear = ((year % 33) * 8 + ((Math.floor((year % 33) / 4)) * 5) + 5) % 30 < 8;
    return isLeapYear ? 30 : 29;
};

export function PersianDatePicker({
    label,
    placeholder = "روز/ماه/سال",
    value,
    onChange,
    error,
    required
}: PersianDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState<number>(1380);
    const [selectedMonth, setSelectedMonth] = useState<number>(1);
    const [selectedDay, setSelectedDay] = useState<number>(1);

    const currentPersianYear = 1403;
    const years = Array.from({ length: 80 }, (_, i) => currentPersianYear - i);

    const handleDateSelect = (day: number, month: number, year: number) => {
        const formattedDate = `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
        onChange(formattedDate);
        setIsOpen(false);
    };

    const formatDisplayDate = (dateString: string) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('/');
        return `${day} ${persianMonths[parseInt(month) - 1]} ${year}`;
    };

    return (
        <div className="relative">
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                <Input
                    label={label}
                    placeholder={placeholder}
                    value={value ? formatDisplayDate(value) : ''}
                    readOnly
                    required={required}
                    error={error}
                    className="cursor-pointer"
                />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 p-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">سال</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ماه</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {persianMonths.map((month, index) => (
                                    <option key={index + 1} value={index + 1}>{month}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">روز</label>
                            <select
                                value={selectedDay}
                                onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1).map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            انصراف
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDateSelect(selectedDay, selectedMonth, selectedYear)}
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700"
                        >
                            انتخاب
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
