export async function convertToFile(
    source: string | Blob | HTMLCanvasElement | null | undefined,
    filename: string,
    mimeType: string = 'image/jpeg',
    quality: number = 0.8
): Promise<File | null> {
    try {
        if (source == null) {
            console.warn('convertToFile called with null/undefined source');
            return null;
        }
        let blob: Blob | null = null;

        if (source instanceof Blob) {
            blob = source;
        } else if (typeof source === 'string') {
            try {
                const response = await fetch(source);
                blob = await response.blob();
            } catch (error) {
                console.error('Failed to fetch data URL:', error);
                return null;
            }
        } else if (source instanceof HTMLCanvasElement) {
            blob = await new Promise<Blob | null>((resolve) => {
                source.toBlob((b) => resolve(b), mimeType, quality);
                setTimeout(() => resolve(null), 2000);
            });
        }

        if (!blob) {
            return null;
        }

        const uuid = generateUUID();
        const extension = mimeType.split('/')[1] || 'jpg';
        const fullFilename = `${filename}_${uuid}.${extension}`;

        return new File([blob], fullFilename, { type: mimeType });
    } catch (error) {
        console.error('Error converting to file:', error);
        return null;
    }
}

export async function mirrorImageBlob(original: Blob, mimeType = 'image/jpeg', quality = 0.8): Promise<Blob | null> {
    try {
        const url = URL.createObjectURL(original);
        const img = document.createElement('img');
        img.src = url;

        await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('image load failed'));
        });

        const w = img.naturalWidth || 1;
        const h = img.naturalHeight || 1;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            URL.revokeObjectURL(url);
            return null;
        }

        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, w, h);
        ctx.restore();

        const blob: Blob | null = await new Promise((resolve) => {
            canvas.toBlob((b) => resolve(b), mimeType, quality);
            // safety: if toBlob doesn't call back, resolve null after timeout
            setTimeout(() => resolve(null), 2000);
        });

        URL.revokeObjectURL(url);
        return blob;
    } catch (error) {
        console.warn('mirrorImageBlob failed', error);
        return null;
    }
}

export function generateUUID(): string {
    type MaybeCrypto = { crypto?: { randomUUID?: () => string } };
    const maybe = globalThis as unknown as MaybeCrypto;

    if (maybe?.crypto && typeof maybe.crypto.randomUUID === 'function') {
        return maybe.crypto.randomUUID();
    }

    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function createBPMSFormData(
    file: File,
    serviceName: string,
    processId: number | null,
    formName: string,
    additionalBody?: Record<string, unknown>
): FormData {
    const body = {
        serviceName,
        processId,
        formName,
        body: additionalBody || {},
    };

    const formData = new FormData();
    formData.append('messageDTO', JSON.stringify(body));
    formData.append('files', file);

    return formData;
}
