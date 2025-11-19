export type OcrResult = { text: string };

export async function ocrRecognizeFile(file: File | Blob): Promise<string> {
    try {
        // Lazy load Tesseract فقط وقتی نیاز است
        const Tesseract = (await import('tesseract.js')).default;
        const res = await Tesseract.recognize(file, 'fas');
        const dataText = (res as unknown as { data?: { text?: string } })?.data?.text;
        return typeof dataText === 'string' ? dataText : '';
    } catch (e) {
        console.warn('ocrRecognizeFile error', e);
        return '';
    }
}

export type OcrFields = {
    nationalId?: string;
    firstName?: string;
    lastName?: string;
    fatherName?: string;
    dob?: string;
};

const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
const toAsciiDigits = (s: string) =>
    s
        .replace(/[۰۱۲۳۴۵۶۷۸۹]/g, (d) => String(persianDigits.indexOf(d)))
        .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660));

export function parseNationalCardFields(text: string): OcrFields {
    const t = text || '';
    const ascii = toAsciiDigits(t);
    const fields: OcrFields = {};

    // کم‌حساس‌تر: کد ملی 6 تا 12 رقم (با فاصله یا بدون فاصله)
    const nidMatch = ascii.match(/\b(\d[\d\s]{5,11}\d)\b/);
    if (nidMatch) {
        // حذف فاصله‌ها
        fields.nationalId = nidMatch[1].replace(/\s+/g, '');
    }

    const dateMatch = ascii.match(/(\d{2,4}[\/\-]\d{1,2}[\/\-]\d{1,4})/);
    if (dateMatch) fields.dob = dateMatch[1];

    const persianWordRe = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]{2,}/g;
    const words = Array.from(
        new Set((t.match(persianWordRe) || []).map((s) => s.trim()).filter(Boolean))
    );
    if (words.length >= 1) fields.firstName = words[0];
    if (words.length >= 2) fields.lastName = words[1];

    const fatherMatch = t.match(/(?:نام\s*پدر|پدر)[:\s\-–]*([\u0600-\u06FF\s]{2,40})/i);
    if (fatherMatch) fields.fatherName = fatherMatch[1].trim();

    return fields;
}
