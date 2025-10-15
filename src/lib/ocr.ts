/* eslint-disable @typescript-eslint/no-explicit-any */
export type OcrResult = { text: string };

export async function ocrRecognizeFile(file: File | Blob): Promise<string> {
    try {
        const res = await recognizeWithTesseract(file, 'fas');
        return res;
    } catch (e) {
        console.warn('ocrRecognizeFile error', e);
        return '';
    }
}

export const isTextDetectorAvailable = (): boolean => {
    const w: any = typeof window !== 'undefined' ? window : undefined;
    return !!(w && typeof w.TextDetector === 'function');
};

export async function detectWithTextDetectorFromBlob(blob: Blob): Promise<string> {
    if (!isTextDetectorAvailable()) return '';
    try {
        const bmp = await (createImageBitmap as any)(blob as Blob);
        const Detector: any = (window as any).TextDetector;
        const det = new Detector();
        const regions = await det.detect(bmp as ImageBitmap);
        bmp.close?.();
        const lines: string[] = [];
        for (const r of regions) {
            const txt = r.rawValue ?? r.value ?? r.text ?? '';
            if (txt && typeof txt === 'string') lines.push(txt.trim());
        }
        const joined = lines.join('\n');
        return joined;
    } catch {
        return '';
    }
}

export async function recognizeWithTesseract(
    blob: Blob,
    lang = 'fas',
    onProgress?: (p: number) => void,
    langPath?: string
): Promise<string> {
    try {
        const mod = await import('tesseract.js');
        const { createWorker } = mod as any;
        const logger = onProgress
            ? (m: any) => {
                  try {
                      if (m && typeof m === 'object' && typeof m.progress === 'number')
                          onProgress(Math.max(0, Math.min(1, m.progress)));
                  } catch {}
              }
            : undefined;

        const wrappedLogger = (m: any) => {
            if (logger) {
                try {
                    logger(m);
                } catch {}
            }
        };

        const workerOpts: any = { logger: wrappedLogger };
        if (langPath) workerOpts.langPath = langPath;
        const worker = createWorker(workerOpts);
        try {
            await worker.load();
        } catch (e) {
            console.warn('[ocr] worker.load failed', e);
            throw e;
        }
        try {
            await worker.loadLanguage(lang);
        } catch (e) {
            console.warn('[ocr] worker.loadLanguage failed for', lang, e);
            throw e;
        }
        try {
            await worker.initialize(lang);
        } catch (e) {
            console.warn('[ocr] worker.initialize failed for', lang, e);
            throw e;
        }

        const res = await worker.recognize(blob);
        const text = res && res.data && res.data.text ? String(res.data.text) : '';
        try {
            await worker.terminate();
        } catch {}
        return text;
    } catch (e) {
        console.warn('[ocr] tesseract fallback failed', e);
        if (lang !== 'eng') {
            try {
                const retry = await recognizeWithTesseract(blob, 'eng', onProgress, langPath);
                return retry;
            } catch (er) {
                console.warn('[ocr] retry with eng failed', er);
            }
        }
        return '';
    }
}

export type OCRResult = { text: string; engine: 'textdetector' | 'tesseract' | null };

export default async function runOcrFromBlob(
    blob: Blob,
    opts?: {
        lang?: string;
        onProgress?: (p: number) => void;
        preferTextDetector?: boolean;
        langPath?: string;
    }
): Promise<OCRResult> {
    const lang = opts?.lang ?? 'fas';
    const preferTD = opts?.preferTextDetector ?? true;
    if (preferTD && isTextDetectorAvailable()) {
        const txt = await detectWithTextDetectorFromBlob(blob);
        if (txt && txt.length > 0) return { text: txt, engine: 'textdetector' };
    }

    const ttxt = await recognizeWithTesseract(blob, lang, opts?.onProgress, opts?.langPath);
    if (ttxt && ttxt.length > 0) return { text: ttxt, engine: 'tesseract' };
    return { text: '', engine: null };
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

    const nidMatch = ascii.match(/\b(\d{10})\b/);
    if (nidMatch) fields.nationalId = nidMatch[1];

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
