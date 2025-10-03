export const convertToEnglishNumbers = (value: string): string => {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    let result = value;

    for (let i = 0; i < persianNumbers.length; i++) {
        result = result.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
    }

    for (let i = 0; i < arabicNumbers.length; i++) {
        result = result.replace(new RegExp(arabicNumbers[i], 'g'), englishNumbers[i]);
    }

    return result;
};

export const convertToEnglishDigits = convertToEnglishNumbers;

export const convertToPersianDigits = (str: string): string => {
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    return str.replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
};

export const isOnlyEnglishNumbers = (value: string): boolean => {
    return /^[0-9]*$/.test(value);
};

export const normalizeNumbers = (value: string): string => {
    if (!value) return value;

    if (isOnlyEnglishNumbers(value)) {
        return value;
    }

    return convertToEnglishNumbers(value);
};
