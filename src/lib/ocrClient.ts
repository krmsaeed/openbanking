/* eslint-disable @typescript-eslint/no-explicit-any */
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
            console.warn('[ocrClient] worker.load failed', e);
            throw e;
        }
        try {
            await worker.loadLanguage(lang);
        } catch (e) {
            console.warn('[ocrClient] worker.loadLanguage failed for', lang, e);
            throw e;
        }
        try {
            await worker.initialize(lang);
        } catch (e) {
            console.warn('[ocrClient] worker.initialize failed for', lang, e);
            throw e;
        }

        const res = await worker.recognize(blob);
        const text = res && res.data && res.data.text ? String(res.data.text) : '';
        try {
            await worker.terminate();
        } catch {}
        return text;
    } catch (e) {
        console.warn('[ocrClient] tesseract fallback failed', e);
        if (lang !== 'eng') {
            try {
                const retry = await recognizeWithTesseract(blob, 'eng', onProgress, langPath);
                return retry;
            } catch (er) {
                console.warn('[ocrClient] retry with eng failed', er);
            }
        }
        return '';
    }
}

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
