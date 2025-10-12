/**
 * Utility functions for file and blob handling
 */

/**
 * Converts a data URL or blob to a File object
 * @param source - Data URL string, Blob/File, Canvas element, or null/undefined
 * @param filename - Name for the file (without extension)
 * @param mimeType - MIME type for the file (e.g., 'image/jpeg', 'image/png')
 * @param quality - Quality for image compression (0-1), only used for canvas conversion
 * @returns Promise<File | null>
 */
export async function convertToFile(
    source: string | Blob | HTMLCanvasElement | null | undefined,
    filename: string,
    mimeType: string = 'image/jpeg',
    quality: number = 0.8
): Promise<File | null> {
    try {
        if (source == null) {
            // caller passed no source (null/undefined) — nothing to convert
            console.warn('convertToFile called with null/undefined source');
            return null;
        }
        let blob: Blob | null = null;

        // If source is already a Blob
        if (source instanceof Blob) {
            blob = source;
        }
        // If source is a data URL string
        else if (typeof source === 'string') {
            try {
                const response = await fetch(source);
                blob = await response.blob();
            } catch (error) {
                console.error('Failed to fetch data URL:', error);
                return null;
            }
        }
        // If source is a Canvas element
        else if (source instanceof HTMLCanvasElement) {
            blob = await new Promise<Blob | null>((resolve) => {
                source.toBlob((b) => resolve(b), mimeType, quality);
                // Timeout after 2 seconds
                setTimeout(() => resolve(null), 2000);
            });
        }

        if (!blob) {
            return null;
        }

        // Generate UUID for filename
        const uuid = generateUUID();
        const extension = mimeType.split('/')[1] || 'jpg';
        const fullFilename = `${filename}_${uuid}.${extension}`;

        // Create and return File object
        return new File([blob], fullFilename, { type: mimeType });
    } catch (error) {
        console.error('Error converting to file:', error);
        return null;
    }
}

/**
 * Generates a UUID or fallback to timestamp-based ID
 * @returns string
 */
export function generateUUID(): string {
    type MaybeCrypto = { crypto?: { randomUUID?: () => string } };
    const maybe = globalThis as unknown as MaybeCrypto;

    if (maybe?.crypto && typeof maybe.crypto.randomUUID === 'function') {
        return maybe.crypto.randomUUID();
    }

    // Fallback to timestamp-based ID
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Creates FormData with message and file for BPMS upload
 * @param file - File object to upload
 * @param serviceName - BPMS service name
 * @param processId - Process ID
 * @param formName - Form name
 * @param additionalBody - Additional body parameters
 * @returns FormData
 */
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
