/* eslint-disable @typescript-eslint/no-explicit-any */
/* Lightweight client-side OCR helper
 * Strategy:
 *  - Try the browser TextDetector first (fast, native).
 *  - If not available, lazy-load tesseract.js and run OCR in a worker.
 *
 * Exports:
 *  - runOcrFromBlob(blob, opts?) => { text, engine }
 */
type OCRResult = { text: string; engine: 'textdetector' | 'tesseract' | null };

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
        try {
            console.debug('[ocrClient] TextDetector regions count:', Array.isArray(regions) ? regions.length : 'unknown');
        } catch { }
        for (const r of regions) {
            const txt = r.rawValue ?? r.value ?? r.text ?? '';
            if (txt && typeof txt === 'string') lines.push(txt.trim());
        }
        const joined = lines.join('\n');
        console.debug('[ocrClient] TextDetector text length:', joined.length);
        return joined;
    } catch {
        // If TextDetector failed for some reason, return empty string so caller may fallback
        return '';
    }
}

export async function recognizeWithTesseract(blob: Blob, lang = 'fas', onProgress?: (p: number) => void, langPath?: string): Promise<string> {
    try {
        console.debug('[ocrClient] attempting tesseract fallback, lang=', lang);
        const mod = await import('tesseract.js');
        const { createWorker } = mod as any;
        const logger = onProgress
            ? (m: any) => {
                try {
                    if (m && typeof m === 'object' && typeof m.progress === 'number') onProgress(Math.max(0, Math.min(1, m.progress)));
                } catch { }
            }
            : undefined;

        // also mirror progress to console for debugging
        const wrappedLogger = (m: any) => {
            try { if (m && typeof m === 'object') console.debug('[ocrClient][tesseract] log', m); } catch { }
            if (logger) {
                try { logger(m); } catch { }
            }
        };

        // pass langPath if provided so tesseract doesn't try to download from the CDN
        const workerOpts: any = { logger: wrappedLogger };
        if (langPath) workerOpts.langPath = langPath;
        const worker = createWorker(workerOpts);
        // Use the documented async init sequence. Some environments differ, so guard each step.
        try { await worker.load(); } catch (e) { console.warn('[ocrClient] worker.load failed', e); throw e; }
        try { await worker.loadLanguage(lang); } catch (e) { console.warn('[ocrClient] worker.loadLanguage failed for', lang, e); throw e; }
        try { await worker.initialize(lang); } catch (e) { console.warn('[ocrClient] worker.initialize failed for', lang, e); throw e; }

        // Tesseract accepts a URL, File, or Blob. Using blob directly is fine.
        const res = await worker.recognize(blob);
        const text = (res && res.data && res.data.text) ? String(res.data.text) : '';
        console.debug('[ocrClient] tesseract recognized length:', text ? text.length : 0);
        try { await worker.terminate(); } catch { }
        return text;
    } catch (e) {
        console.warn('[ocrClient] tesseract fallback failed', e);
        // If the requested language failed and it's not English, try English as a best-effort fallback
        if (lang !== 'eng') {
            try {
                console.debug('[ocrClient] retrying tesseract with lang=eng');
                const retry = await recognizeWithTesseract(blob, 'eng', onProgress, langPath);
                return retry;
            } catch (er) {
                console.warn('[ocrClient] retry with eng failed', er);
            }
        }
        return '';
    }
}

export default async function runOcrFromBlob(blob: Blob, opts?: { lang?: string; onProgress?: (p: number) => void; preferTextDetector?: boolean; langPath?: string }): Promise<OCRResult> {
    const lang = opts?.lang ?? 'fas';
    const preferTD = opts?.preferTextDetector ?? true;
    // Try native TextDetector first unless explicitly disabled
    if (preferTD && isTextDetectorAvailable()) {
        const txt = await detectWithTextDetectorFromBlob(blob);
        if (txt && txt.length > 0) return { text: txt, engine: 'textdetector' };
        // fallthrough to tesseract if TD returned nothing
    }

    // Fallback: tesseract.js via lazy import
    const ttxt = await recognizeWithTesseract(blob, lang, opts?.onProgress, opts?.langPath);
    if (ttxt && ttxt.length > 0) return { text: ttxt, engine: 'tesseract' };
    return { text: '', engine: null };
}
