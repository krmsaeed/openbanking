export interface VerificationData {
    signature: string;
    video: Blob;
    type: 'login' | 'register';
    timestamp: number;
    userInfo?: {
        firstName?: string;
        lastName?: string;
        nationalId?: string;
        phoneNumber?: string;
    };
}

export const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

export const submitVerificationData = async (
    data: VerificationData
): Promise<{
    success: boolean;
    message: string;
    referenceId?: string;
}> => {
    try {
        const formData = new FormData();

        const signatureBlob = base64ToBlob(data.signature, 'image/png');
        formData.append('signature', signatureBlob, 'signature.png');

        formData.append('video', data.video, 'selfie-video.webm');

        formData.append('type', data.type);
        formData.append('timestamp', data.timestamp.toString());

        if (data.userInfo) {
            formData.append('userInfo', JSON.stringify(data.userInfo));
        }

        const response = await fetch('/api/verification', {
            method: 'POST',
            body: formData,
            headers: {},
        });

        const result = await response.json();

        if (response.ok) {
            return {
                success: true,
                message: 'اطلاعات با موفقیت ارسال شد',
                referenceId: result.referenceId,
            };
        } else {
            return {
                success: false,
                message: result.message || 'خطا در ارسال اطلاعات',
            };
        }
    } catch {
        return {
            success: false,
            message: 'خطا در ارتباط با سرور',
        };
    }
};

export const validateSignature = (signatureCanvas: HTMLCanvasElement): boolean => {
    const canvas = signatureCanvas;
    const ctx = canvas.getContext('2d');

    if (!ctx) return false;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
            return true;
        }
    }

    return false;
};

export const validateVideo = (
    videoBlob: Blob
): {
    isValid: boolean;
    duration?: number;
    size: number;
} => {
    const maxSize = 10 * 1024 * 1024;
    const minSize = 100 * 1024;

    return {
        isValid: videoBlob.size >= minSize && videoBlob.size <= maxSize,
        size: videoBlob.size,
    };
};

export const generateReferenceId = (): string => {
    const timestamp = window !== undefined && Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `VER_${timestamp}_${random}`.toUpperCase();
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const checkBrowserSupport = (): {
    mediaRecorder: boolean;
    getUserMedia: boolean;
    canvas: boolean;
} => {
    return {
        mediaRecorder: typeof MediaRecorder !== 'undefined',
        getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        canvas: !!document.createElement('canvas').getContext,
    };
};
