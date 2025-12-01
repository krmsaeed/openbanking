import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * تشخیص رنگ پوست برای طیف وسیعی از رنگ‌های پوست
 * از فضای رنگی YCbCr و HSV برای تشخیص دقیق‌تر استفاده می‌کند
 */
function detectSkinTone(r: number, g: number, b: number): boolean {
    // روش 1: استفاده از فضای رنگی YCbCr
    // این روش برای همه رنگ‌های پوست از خیلی روشن تا خیلی تیره کار می‌کند
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

    // محدوده YCbCr برای پوست (برای همه رنگ‌های پوست)
    const yCbCrSkin = y > 40 && cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;

    // روش 2: قوانین RGB سنتی (بهبود یافته برای پوست‌های تیره)
    const maxRGB = Math.max(r, g, b);
    const minRGB = Math.min(r, g, b);
    const diff = maxRGB - minRGB;

    // برای پوست‌های روشن تا متوسط
    const lightSkin = r > 95 && g > 40 && b > 20 && diff > 15 && r > g && r > b;

    // برای پوست‌های تیره
    const darkSkin = r > 40 && g > 30 && b > 15 && r >= g && r >= b && diff > 10 && diff < 80;

    // روش 3: بررسی نسبت‌های رنگی
    const sum = r + g + b;
    if (sum === 0) return false;

    const rRatio = r / sum;
    const gRatio = g / sum;
    const bRatio = b / sum;

    // پوست معمولاً قرمز بیشتری نسبت به آبی دارد
    const rgbRatioSkin = rRatio > 0.3 && gRatio > 0.25 && bRatio < 0.35 && rRatio > bRatio;

    // حداقل یکی از روش‌ها باید تأیید کند
    return yCbCrSkin || lightSkin || darkSkin || rgbRatioSkin;
}

interface UseSelfieStepReturn {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    stream: MediaStream | null;
    capturedPhoto: string | null;
    error: string | null;
    isUploading: boolean;
    isClient: boolean;
    cameraLoading: boolean;
    faceDetected: boolean;
    faceTooFar: boolean;
    eyesCentered: boolean;
    closenessPercent: number;
    obstructionRatio: number;
    eyeFeatureRatio: number;
    lastBoxSkin: number | null;
    targetSkin: number | null;
    startCamera: () => Promise<void>;
    stopCamera: () => void;
    capturePhoto: () => Promise<void>;
    retakePhoto: () => void;
    setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
    MIN_EYE_RATIO: number;
    MAX_OBSTRUCTION: number;
}

export interface UseSelfieStepConfig {
    minEyeRatio?: number;
    maxObstruction?: number;
}

export function useSelfieStep(config?: UseSelfieStepConfig): UseSelfieStepReturn {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const procCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const glRef = useRef<WebGL2RenderingContext | null>(null);
    const webglTexRef = useRef<WebGLTexture | null>(null);
    const webglFboRef = useRef<WebGLFramebuffer | null>(null);
    const webglProgRef = useRef<WebGLProgram | null>(null);
    const webglVaoRef = useRef<WebGLVertexArrayObject | null>(null);
    const webglVboRef = useRef<WebGLBuffer | null>(null);
    const autoCaptureTriggeredRef = useRef(false);
    const autoCaptureTimerRef = useRef<number | null>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [cameraLoading, setCameraLoading] = useState(true);
    const [faceDetected, setFaceDetected] = useState(false);
    const [faceTooFar, setFaceTooFar] = useState(false);
    const [eyesCentered, setEyesCentered] = useState(true);
    const [closenessPercent, setClosenessPercent] = useState(0);
    const [lastBoxSkin, setLastBoxSkin] = useState<number | null>(null);
    const [targetSkin, setTargetSkin] = useState<number | null>(null);
    const [obstructionRatio, setObstructionRatio] = useState(0);
    const [eyeFeatureRatio, setEyeFeatureRatio] = useState(0);

    const MIN_EYE_RATIO = config?.minEyeRatio ?? 0.025; // افزایش از 0.02 به 0.025
    const MAX_OBSTRUCTION = config?.maxObstruction ?? 0.1; // کاهش از 0.12 به 0.10
    const PROC_W = 128;
    const PROC_H = 96;

    const detectFaceThrottleRef = useRef<((() => void) & { cancel?: () => void }) | null>(null);

    useEffect(() => {
        void setTargetSkin;
    }, [lastBoxSkin, targetSkin, setTargetSkin]);

    type ThrottledFn = (() => void) & { cancel?: () => void };
    const createThrottled = useCallback((fn: () => void, wait = 250): ThrottledFn => {
        let last = 0;
        let timer: number | null = null;
        const wrapped = (() => {
            const now = Date.now();
            const remaining = wait - (now - last);
            if (remaining <= 0) {
                last = now;
                fn();
            } else if (!timer) {
                timer = window.setTimeout(() => {
                    last = Date.now();
                    timer = null;
                    fn();
                }, remaining) as unknown as number;
            }
        }) as ThrottledFn;
        wrapped.cancel = () => {
            if (timer) {
                clearTimeout(timer as number);
                timer = null;
            }
        };
        return wrapped;
    }, []);

    const initWebGL = useCallback(() => {
        try {
            if (glRef.current) return;
            const pc = document.createElement('canvas');
            pc.width = PROC_W;
            pc.height = PROC_H;
            const gl = pc.getContext('webgl2') as WebGL2RenderingContext | null;
            if (!gl) {
                glRef.current = null;
                procCanvasRef.current = null;
                return;
            }
            procCanvasRef.current = pc;
            glRef.current = gl;

            const vsSource = `#version 300 es
            in vec2 a_pos;
            in vec2 a_uv;
            out vec2 v_uv;
            void main() {
                v_uv = a_uv;
                gl_Position = vec4(a_pos, 0.0, 1.0);
            }`;

            const fsSource = `#version 300 es
            precision mediump float;
            in vec2 v_uv;
            uniform sampler2D u_tex;
            out vec4 outColor;
            void main() {
                vec4 c = texture(u_tex, v_uv);
                outColor = c;
            }`;

            const compile = (type: number, src: string) => {
                const _gl = gl as WebGL2RenderingContext;
                const s = _gl.createShader(type)!;
                _gl.shaderSource(s, src);
                _gl.compileShader(s);
                if (!_gl.getShaderParameter(s, _gl.COMPILE_STATUS)) {
                    const info = _gl.getShaderInfoLog(s);
                    _gl.deleteShader(s);
                    throw new Error('Shader compile error: ' + info);
                }
                return s;
            };

            const vs = compile(gl.VERTEX_SHADER, vsSource);
            const fs = compile(gl.FRAGMENT_SHADER, fsSource);
            const prog = gl.createProgram();
            if (!prog) throw new Error('Could not create program');
            gl.attachShader(prog, vs);
            gl.attachShader(prog, fs);
            gl.linkProgram(prog);
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                const info = gl.getProgramInfoLog(prog);
                throw new Error('Program link error: ' + info);
            }
            webglProgRef.current = prog;

            const vao = gl.createVertexArray();
            gl.bindVertexArray(vao);

            const verts = new Float32Array([
                -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, -1, 1, 0, 1, 1, -1, 1, 0, 1, 1, 1, 1,
            ]);
            const vbo = gl.createBuffer();
            webglVboRef.current = vbo;
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
            gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

            const aPos = gl.getAttribLocation(prog, 'a_pos');
            const aUv = gl.getAttribLocation(prog, 'a_uv');
            gl.enableVertexAttribArray(aPos);
            gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
            gl.enableVertexAttribArray(aUv);
            gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

            webglVaoRef.current = vao;

            const tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            const targetTex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, targetTex);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                PROC_W,
                PROC_H,
                0,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                null
            );
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            const fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(
                gl.FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_2D,
                targetTex,
                0
            );

            webglTexRef.current = tex;
            webglFboRef.current = fbo;

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindVertexArray(null);
        } catch (e) {
            console.warn('WebGL2 init failed:', e);
            glRef.current = null;
            procCanvasRef.current = null;
        }
    }, []);

    const detectFace = useCallback(() => {
        if (!videoRef.current || !stream) return;

        const video = videoRef.current;

        if (video.readyState < 2 || video.paused) {
            return;
        }

        const gl = glRef.current;
        if (
            gl &&
            procCanvasRef.current &&
            webglProgRef.current &&
            webglTexRef.current &&
            webglFboRef.current
        ) {
            try {
                gl.bindFramebuffer(gl.FRAMEBUFFER, webglFboRef.current);
                gl.viewport(0, 0, PROC_W, PROC_H);
                gl.useProgram(webglProgRef.current as WebGLProgram);

                gl.bindTexture(gl.TEXTURE_2D, webglTexRef.current);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

                gl.bindVertexArray(webglVaoRef.current);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, webglTexRef.current);
                const loc = gl.getUniformLocation(webglProgRef.current as WebGLProgram, 'u_tex');
                gl.uniform1i(loc, 0);
                gl.drawArrays(gl.TRIANGLES, 0, 6);

                const readBuf = new Uint8Array(PROC_W * PROC_H * 4);
                gl.readPixels(0, 0, PROC_W, PROC_H, gl.RGBA, gl.UNSIGNED_BYTE, readBuf);

                const faceX = Math.floor(PROC_W * 0.5);
                const faceY = Math.floor(PROC_H * 0.45); // تغییر از 0.4 به 0.45 - تمرکز بیشتر روی مرکز صورت
                const faceRadius = Math.min(PROC_W, PROC_H) * 0.18; // افزایش از 0.15 به 0.18 - ناحیه بزرگتر برای صورت

                const cSize = Math.floor(faceRadius * 2);
                let skinPixels = 0;
                let eyeFeatureXSum = 0;
                let eyeFeatureCount = 0;
                let noseFeatures = 0; // تشخیص بینی
                let mouthFeatures = 0; // تشخیص دهان
                let obstructionPixels = 0;
                let circularPixelCount = 0;
                let avgBrightness = 0;

                for (let y = 0; y < cSize; y++) {
                    for (let x = 0; x < cSize; x++) {
                        const dx = x - faceRadius;
                        const dy = y - faceRadius;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance <= faceRadius) {
                            const px = Math.max(
                                0,
                                Math.min(PROC_W - 1, Math.floor(faceX - faceRadius + x))
                            );
                            const py = Math.max(
                                0,
                                Math.min(PROC_H - 1, Math.floor(faceY - faceRadius + y))
                            );
                            const i = (py * PROC_W + px) * 4;
                            const r = readBuf[i];
                            const g = readBuf[i + 1];
                            const b = readBuf[i + 2];
                            const gray = (r + g + b) / 3;
                            circularPixelCount++;
                            avgBrightness += gray;

                            // تشخیص پوست برای طیف وسیع‌تری از رنگ‌های پوست
                            // از فرمول YCbCr برای تشخیص بهتر پوست استفاده می‌کنیم
                            const isSkin = detectSkinTone(r, g, b);
                            if (isSkin) skinPixels++;

                            // محاسبه میانگین محلی برای تشخیص ویژگی‌ها
                            let localSum = 0;
                            let localCount = 0;
                            for (
                                let ny = Math.max(0, py - 1);
                                ny <= Math.min(PROC_H - 1, py + 1);
                                ny++
                            ) {
                                for (
                                    let nx = Math.max(0, px - 1);
                                    nx <= Math.min(PROC_W - 1, px + 1);
                                    nx++
                                ) {
                                    const ni = (ny * PROC_W + nx) * 4;
                                    localSum +=
                                        (readBuf[ni] + readBuf[ni + 1] + readBuf[ni + 2]) / 3;
                                    localCount++;
                                }
                            }
                            const localAvg = localCount > 0 ? localSum / localCount : gray;

                            // برای محاسبه مرکزیت بینی/دهان
                            eyeFeatureXSum += x;
                            eyeFeatureCount++;

                            // تشخیص بینی - ناحیه مرکزی صورت (0.7 تا 1.1 شعاع عمودی) - WebGL
                            const noseVerticalRange =
                                y >= faceRadius * 0.7 && y <= faceRadius * 1.1;
                            const noseHorizontalRange =
                                Math.abs(x - faceRadius) <= faceRadius * 0.5;
                            if (noseVerticalRange && noseHorizontalRange) {
                                // شرط ساده‌تر: فقط تغییر روشنایی (بدون شرط پوست)
                                const isNoseFeature = Math.abs(gray - localAvg) > 5; // کاهش از 8 به 5
                                if (isNoseFeature) noseFeatures++;
                            }

                            // تشخیص دهان - ناحیه پایینی صورت (1.1 تا 1.4 شعاع عمودی) - WebGL
                            const mouthVerticalRange =
                                y >= faceRadius * 1.1 && y <= faceRadius * 1.4;
                            const mouthHorizontalRange =
                                Math.abs(x - faceRadius) <= faceRadius * 0.45;
                            if (mouthVerticalRange && mouthHorizontalRange) {
                                // شرط ساده‌تر: فقط تغییر روشنایی (بدون شرط پوست)
                                const isMouthFeature = Math.abs(gray - localAvg) > 3; // کاهش از 5 به 3
                                if (isMouthFeature) mouthFeatures++;
                            }

                            const isBright = gray > 220;
                            const isDark = gray < 30;
                            if (isBright || isDark) obstructionPixels++;
                        }
                    }
                }

                if (circularPixelCount === 0) return;

                avgBrightness = avgBrightness / circularPixelCount;
                const skinRatio = skinPixels / circularPixelCount;
                const noseRatio = noseFeatures / circularPixelCount; // نسبت بینی
                const mouthRatio = mouthFeatures / circularPixelCount; // نسبت دهان
                const obstructionRatio = obstructionPixels / circularPixelCount;

                let centerBoxClose = true;
                let currentClosenessPercent: number | null = null;
                try {
                    const boxW = Math.max(4, Math.floor(PROC_W * 0.5));
                    const boxH = Math.max(4, Math.floor(PROC_H * 0.6));
                    const boxX = Math.max(0, Math.floor(PROC_W * 0.5 - boxW / 2));
                    const boxY = Math.max(0, Math.floor(PROC_H * 0.4 - boxH / 2));
                    let boxSkin = 0;
                    let boxTotal = 0;
                    for (let yy = boxY; yy < boxY + boxH; yy++) {
                        for (let xx = boxX; xx < boxX + boxW; xx++) {
                            const bi = (yy * PROC_W + xx) * 4;
                            const r = readBuf[bi];
                            const g = readBuf[bi + 1];
                            const b = readBuf[bi + 2];
                            // استفاده از تابع تشخیص پوست بهبود یافته
                            if (detectSkinTone(r, g, b)) boxSkin++;
                            boxTotal++;
                        }
                    }
                    const boxSkinRatio = boxTotal > 0 ? boxSkin / boxTotal : 0;
                    setLastBoxSkin(boxSkinRatio);
                    if (targetSkin !== null) {
                        const rawRel = boxSkinRatio / Math.max(1e-6, targetSkin);
                        const percentRel = Math.round(Math.max(0, Math.min(1.5, rawRel)) * 100);
                        currentClosenessPercent = percentRel;
                        setClosenessPercent(percentRel);
                        centerBoxClose = percentRel >= 60; // کاهش از 80 به 60
                    } else {
                        // محدوده‌های تنظیم شده برای همه رنگ‌های پوست
                        const minSkin = 0.08; // افزایش از 0.05 برای دقت بیشتر
                        const maxSkin = 0.4; // کاهش از 0.45
                        const raw = Math.max(
                            0,
                            Math.min(1, (boxSkinRatio - minSkin) / (maxSkin - minSkin))
                        );
                        const percent = Math.round(raw * 100);
                        currentClosenessPercent = percent;
                        setClosenessPercent(percent);
                        centerBoxClose = percent >= 65; // افزایش از 60 به 65
                    }
                    setFaceTooFar(!centerBoxClose);
                } catch {
                    centerBoxClose = true;
                }

                const skinFactor = Math.min(skinRatio * 4, 1);
                const noseFactor = Math.min(noseRatio * 50, 1); // فاکتور بینی - ضریب بالا
                const mouthFactor = Math.min(mouthRatio * 40, 1); // فاکتور دهان - ضریب بالا
                const brightnessFactor = avgBrightness > 50 && avgBrightness < 200 ? 1 : 0;

                // تمرکز فقط بر بینی و دهان
                const confidence =
                    skinFactor * 0.3 + // افزایش وزن پوست
                    noseFactor * 0.35 + // افزایش وزن بینی
                    mouthFactor * 0.25 + // افزایش وزن دهان
                    brightnessFactor * 0.1; // روشنایی

                const MIN_NOSE_RATIO = 0.005; // افزایش از 0.003 به 0.005
                const MIN_MOUTH_RATIO = 0.005; // افزایش از 0.003 به 0.005

                const detected =
                    confidence > 0.4 &&
                    obstructionRatio < 0.25 &&
                    centerBoxClose &&
                    skinRatio >= 0.15 && // باید حتما پوست داشته باشه
                    noseRatio >= MIN_NOSE_RATIO && // چک کردن بینی
                    mouthRatio >= MIN_MOUTH_RATIO && // چک کردن دهان
                    (currentClosenessPercent ?? 0) >= 55;

                setFaceDetected(detected);
                setFaceTooFar(!centerBoxClose);
                setObstructionRatio(obstructionRatio);
                setEyeFeatureRatio(noseRatio); // استفاده از noseRatio به جای eyeRatio

                if (eyeFeatureCount > 0) {
                    const avgX = eyeFeatureXSum / eyeFeatureCount;
                    const centerX = faceRadius;
                    const offset = (avgX - centerX) / faceRadius;
                    const centered = Math.abs(offset) <= 0.18;
                    setEyesCentered(centered);
                } else {
                    setEyesCentered(true); // تغییر از false به true چون دیگه چشم چک نمی‌کنیم
                }

                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.bindVertexArray(null);
                gl.bindTexture(gl.TEXTURE_2D, null);
                return;
            } catch (err) {
                console.warn('WebGL processing failed, falling back to 2D path', err);
            }
        }

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) return;

        try {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;

            if (canvas.width === 0 || canvas.height === 0) {
                return;
            }

            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const faceX = Math.floor(canvas.width * 0.5);
            const faceY = Math.floor(canvas.height * 0.45); // تغییر از 0.4 به 0.45
            const faceRadius = Math.min(canvas.width, canvas.height) * 0.18; // افزایش از 0.15 به 0.18
            const circularData = context.getImageData(
                faceX - faceRadius,
                faceY - faceRadius,
                faceRadius * 2,
                faceRadius * 2
            );
            const cData = circularData.data;
            const cSize = faceRadius * 2;

            let skinPixels = 0;
            let eyeFeatureXSum = 0;
            let eyeFeatureCount = 0;
            let noseFeatures = 0; // تشخیص بینی
            let mouthFeatures = 0; // تشخیص دهان
            let obstructionPixels = 0;
            let circularPixelCount = 0;
            let avgBrightness = 0;

            for (let y = 0; y < cSize; y++) {
                for (let x = 0; x < cSize; x++) {
                    const dx = x - faceRadius;
                    const dy = y - faceRadius;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance <= faceRadius) {
                        const i = (y * cSize + x) * 4;
                        if (i < cData.length) {
                            const r = cData[i];
                            const g = cData[i + 1];
                            const b = cData[i + 2];
                            const gray = (r + g + b) / 3;

                            circularPixelCount++;
                            avgBrightness += gray;

                            // استفاده از تابع تشخیص پوست بهبود یافته
                            const isSkin = detectSkinTone(r, g, b);
                            if (isSkin) skinPixels++;

                            // محاسبه میانگین محلی
                            let localAvg = gray;
                            try {
                                let localSum = 0;
                                let localCount = 0;
                                for (
                                    let ny = Math.max(0, y - 1);
                                    ny <= Math.min(cSize - 1, y + 1);
                                    ny++
                                ) {
                                    for (
                                        let nx = Math.max(0, x - 1);
                                        nx <= Math.min(cSize - 1, x + 1);
                                        nx++
                                    ) {
                                        const ni = (ny * cSize + nx) * 4;
                                        if (ni < cData.length) {
                                            localSum +=
                                                (cData[ni] + cData[ni + 1] + cData[ni + 2]) / 3;
                                            localCount++;
                                        }
                                    }
                                }
                                if (localCount > 0) localAvg = localSum / localCount;
                            } catch {
                                localAvg = gray;
                            }

                            // برای محاسبه مرکزیت بینی/دهان
                            eyeFeatureXSum += x;
                            eyeFeatureCount++;

                            // تشخیص بینی - ناحیه مرکزی صورت (0.7 تا 1.1 شعاع عمودی)
                            const noseVerticalRange =
                                y >= faceRadius * 0.7 && y <= faceRadius * 1.1;
                            const noseHorizontalRange =
                                Math.abs(x - faceRadius) <= faceRadius * 0.5;
                            if (noseVerticalRange && noseHorizontalRange) {
                                // شرط ساده‌تر: فقط تغییر روشنایی (بدون شرط پوست)
                                const isNoseFeature = Math.abs(gray - localAvg) > 5; // کاهش از 8 به 5
                                if (isNoseFeature) noseFeatures++;
                            }

                            // تشخیص دهان - ناحیه پایینی صورت (1.1 تا 1.4 شعاع عمودی)
                            const mouthVerticalRange =
                                y >= faceRadius * 1.1 && y <= faceRadius * 1.4;
                            const mouthHorizontalRange =
                                Math.abs(x - faceRadius) <= faceRadius * 0.45;
                            if (mouthVerticalRange && mouthHorizontalRange) {
                                // شرط ساده‌تر: فقط تغییر روشنایی (بدون شرط پوست)
                                const isMouthFeature = Math.abs(gray - localAvg) > 3; // کاهش از 5 به 3
                                if (isMouthFeature) mouthFeatures++;
                            }

                            const isBright = gray > 220;
                            const isDark = gray < 30;
                            if (isBright || isDark) {
                                obstructionPixels++;
                            }
                        }
                    }
                }
            }

            if (circularPixelCount === 0) return;

            avgBrightness = avgBrightness / circularPixelCount;
            const skinRatio = skinPixels / circularPixelCount;
            const noseRatio = noseFeatures / circularPixelCount; // نسبت بینی
            const mouthRatio = mouthFeatures / circularPixelCount; // نسبت دهان
            const obstructionRatio = obstructionPixels / circularPixelCount;

            let centerBoxClose = true;
            let currentClosenessPercent: number | null = null;
            try {
                const boxW = Math.max(10, Math.floor(canvas.width * 0.5));
                const boxH = Math.max(10, Math.floor(canvas.height * 0.6));
                const boxX = Math.max(0, Math.floor(faceX - boxW / 2));
                const boxY = Math.max(0, Math.floor(faceY - boxH / 2));
                const boxData = context.getImageData(boxX, boxY, boxW, boxH).data;
                let boxSkin = 0;
                let boxTotal = 0;
                for (let i = 0; i < boxData.length; i += 4) {
                    const r = boxData[i];
                    const g = boxData[i + 1];
                    const b = boxData[i + 2];
                    // استفاده از تابع تشخیص پوست بهبود یافته
                    if (detectSkinTone(r, g, b)) boxSkin++;
                    boxTotal++;
                }
                const boxSkinRatio = boxTotal > 0 ? boxSkin / boxTotal : 0;
                setLastBoxSkin(boxSkinRatio);

                currentClosenessPercent = 0;
                if (targetSkin !== null) {
                    const rawRel = boxSkinRatio / Math.max(1e-6, targetSkin);
                    const percentRel = Math.round(Math.max(0, Math.min(1.5, rawRel)) * 100);
                    currentClosenessPercent = percentRel;
                    setClosenessPercent(percentRel);
                    centerBoxClose = percentRel >= 90;
                } else {
                    // محدوده‌های تنظیم شده برای همه رنگ‌های پوست
                    const minSkin = 0.08; // افزایش از 0.04 برای دقت بیشتر
                    const maxSkin = 0.4; // کاهش از 0.45
                    const raw = Math.max(
                        0,
                        Math.min(1, (boxSkinRatio - minSkin) / (maxSkin - minSkin))
                    );
                    const percent = Math.round(raw * 100);
                    currentClosenessPercent = percent;
                    setClosenessPercent(percent);
                    if (percent < 65)
                        centerBoxClose = false; // افزایش از 60 به 65
                    else centerBoxClose = true;
                }
                setFaceTooFar(!centerBoxClose);
            } catch {
                centerBoxClose = true;
            }

            const skinFactor = Math.min(skinRatio * 4, 1);
            const noseFactor = Math.min(noseRatio * 50, 1); // فاکتور بینی - ضریب بالا
            const mouthFactor = Math.min(mouthRatio * 40, 1); // فاکتور دهان - ضریب بالا
            const brightnessFactor = avgBrightness > 50 && avgBrightness < 200 ? 1 : 0;

            // تمرکز فقط بر بینی و دهان (مسیر 2D fallback)
            const confidence =
                skinFactor * 0.3 + // افزایش وزن پوست
                noseFactor * 0.35 + // افزایش وزن بینی
                mouthFactor * 0.25 + // افزایش وزن دهان
                brightnessFactor * 0.1; // روشنایی

            const MIN_NOSE_RATIO = 0.005; // افزایش از 0.003 به 0.005
            const MIN_MOUTH_RATIO = 0.005; // افزایش از 0.003 به 0.005

            const detected =
                confidence > 0.4 &&
                obstructionRatio < 0.25 &&
                centerBoxClose &&
                skinRatio >= 0.15 && // باید حتما پوست داشته باشه
                noseRatio >= MIN_NOSE_RATIO && // چک کردن بینی
                mouthRatio >= MIN_MOUTH_RATIO && // چک کردن دهان
                (currentClosenessPercent ?? 0) >= 55;
            setFaceDetected(detected);
            setFaceTooFar(!centerBoxClose);
            setObstructionRatio(obstructionRatio);
            setEyeFeatureRatio(noseRatio); // استفاده از noseRatio به جای eyeRatio

            if (eyeFeatureCount > 0) {
                const avgX = eyeFeatureXSum / eyeFeatureCount;
                const centerX = faceRadius;
                const offset = (avgX - centerX) / faceRadius;
                const centered = Math.abs(offset) <= 0.18;
                setEyesCentered(centered);
            } else {
                setEyesCentered(true); // تغییر از false به true چون دیگه چشم چک نمی‌کنیم
            }
        } catch (error) {
            console.error('Face detection error:', error);
        }
    }, [stream, targetSkin]);

    const startCamera = useCallback(async () => {
        setError(null);
        setCameraLoading(true);

        try {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640, min: 480 },
                    height: { ideal: 480, min: 360 },
                },
                audio: false,
            });

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);

                try {
                    initWebGL();
                } catch { }

                const video = videoRef.current;
                const handleCanPlay = () => {
                    video.play().catch(() => { });
                    setCameraLoading(false);
                };

                if (video.readyState >= 3) {
                    handleCanPlay();
                } else {
                    video.addEventListener('canplay', handleCanPlay, { once: true });
                }
            }
        } catch (err) {
            if (err instanceof Error) {
                const errorMessage =
                    err.name === 'NotAllowedError'
                        ? 'دسترسی به دوربین رد شد. لطفاً دسترسی را اجازه دهید.'
                        : err.name === 'NotFoundError'
                            ? 'دوربین یافت نشد. لطفاً از وجود دوربین اطمینان حاصل کنید.'
                            : 'خطا در دسترسی به دوربین. لطفاً دوباره تلاش کنید.';
                setError(errorMessage);
            }
        } finally {
            setCameraLoading(false);
        }
    }, [stream, initWebGL]);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track) => {
                track.stop();
            });
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        try {
            const gl = glRef.current;
            if (gl) {
                if (webglTexRef.current) gl.deleteTexture(webglTexRef.current);
                if (webglFboRef.current) gl.deleteFramebuffer(webglFboRef.current);
                if (webglProgRef.current) gl.deleteProgram(webglProgRef.current);
                if (webglVaoRef.current) gl.deleteVertexArray(webglVaoRef.current);
                if (webglVboRef.current) gl.deleteBuffer(webglVboRef.current);
            }
        } catch { }

        glRef.current = null;
        webglTexRef.current = null;
        webglFboRef.current = null;
        webglProgRef.current = null;
        webglVaoRef.current = null;
        webglVboRef.current = null;
        if (procCanvasRef.current) procCanvasRef.current.width = 0;
        procCanvasRef.current = null;
    }, [stream]);

    const compressImage = useCallback(
        (canvas: HTMLCanvasElement, minSize = 200, maxSize = 800, quality = 0.8): string => {
            // کاهش minSize از 300 به 200، quality از 0.85 به 0.80
            const compressCanvas = document.createElement('canvas');
            const compressContext = compressCanvas.getContext('2d');

            if (!compressContext) return canvas.toDataURL('image/jpeg', quality);

            let { width, height } = canvas;

            // اطمینان از حداقل ابعاد 300×300
            if (width < minSize || height < minSize) {
                const scale = minSize / Math.min(width, height);
                width = Math.round(width * scale);
                height = Math.round(height * scale);
            }

            // محدود کردن به حداکثر ابعاد
            if (width > maxSize || height > maxSize) {
                const scale = maxSize / Math.max(width, height);
                width = Math.round(width * scale);
                height = Math.round(height * scale);
            }

            compressCanvas.width = width;
            compressCanvas.height = height;

            // استفاده از imageSmoothingEnabled برای کیفیت بهتر
            compressContext.imageSmoothingEnabled = true;
            compressContext.imageSmoothingQuality = 'high';

            compressContext.drawImage(canvas, 0, 0, width, height);
            return compressCanvas.toDataURL('image/jpeg', quality);
        },
        []
    );

    const capturePhoto = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || !stream) {
            console.warn('capturePhoto: missing video/canvas/stream');
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) {
            console.error('Could not get canvas context');
            return;
        }

        try {
            if (video.readyState < 2) {
                video.play().catch(() => { });
            }
        } catch { }

        const vw = video.videoWidth || Math.round(video.clientWidth) || 640;
        const vh = video.videoHeight || Math.round(video.clientHeight) || 480;

        // محاسبه مرکز
        const centerX = vw / 2;
        const centerY = vh / 2;

        // محاسبه اندازه مربع - حداقل 200×200 (کاهش از 300)
        let squareSize = Math.min(vw, vh);
        const minSize = 200; // کاهش از 300 به 200

        if (squareSize < minSize) {
            squareSize = minSize;
        }

        // اطمینان از اینکه چهره حداقل 70×70 است (کاهش از 100)
        // با فرض اینکه چهره 60-70% مربع را پر می‌کند
        const estimatedFaceSize = squareSize * 0.7;
        if (estimatedFaceSize < 70) {
            // کاهش از 100 به 70
            squareSize = Math.ceil(70 / 0.7);
        }

        // تنظیم اندازه canvas به اندازه مربع
        canvas.width = squareSize;
        canvas.height = squareSize;

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.save();
        try {
            // رسم تصویر آینه‌ای (flip horizontal)
            context.translate(canvas.width, 0);
            context.scale(-1, 1);

            // رسم بخش مرکزی ویدئو در مربع
            const sourceX = centerX - squareSize / 2;
            const sourceY = centerY - squareSize / 2;

            context.drawImage(
                video,
                sourceX,
                sourceY,
                squareSize,
                squareSize,
                0,
                0,
                squareSize,
                squareSize
            );
        } catch (err) {
            console.warn('drawImage failed', err);
        } finally {
            context.restore();
        }

        // کمپرس با کیفیت 80% و اطمینان از ابعاد حداقل 200×200 (کاهش برای تساهل بیشتر)
        const compressedDataUrl = compressImage(canvas, 200, 800, 0.8);
        setCapturedPhoto(compressedDataUrl);
        setTimeout(() => {
            stopCamera();
        }, 200);
    }, [stream, stopCamera, compressImage]);
    const retakePhoto = useCallback(() => {
        setCapturedPhoto(null);
        setCameraLoading(true);
        startCamera();
    }, [startCamera]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!stream || !videoRef.current) return;

        detectFaceThrottleRef.current = createThrottled(detectFace, 250);

        const interval = window.setInterval(() => {
            if (detectFaceThrottleRef.current) {
                detectFaceThrottleRef.current();
            }
        }, 200);

        return () => {
            clearInterval(interval);
            if (detectFaceThrottleRef.current && detectFaceThrottleRef.current.cancel) {
                detectFaceThrottleRef.current.cancel();
            }
            detectFaceThrottleRef.current = null;
        };
    }, [stream, detectFace, createThrottled]);

    useEffect(() => {
        if (stream && videoRef.current) {
            const video = videoRef.current;

            if (video.srcObject !== stream) {
                video.srcObject = stream;
            }

            const playVideo = () => {
                video.play();
            };

            if (video.readyState >= 2) {
                playVideo();
            } else {
                video.addEventListener('loadeddata', playVideo, { once: true });
            }
        }
    }, [stream]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        setCameraLoading(true);
        startCamera();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const canAuto = !capturedPhoto && faceDetected && eyesCentered;
        if (canAuto && !autoCaptureTriggeredRef.current) {
            autoCaptureTriggeredRef.current = true;
            if (autoCaptureTimerRef.current) window.clearTimeout(autoCaptureTimerRef.current);
            autoCaptureTimerRef.current = window.setTimeout(() => {
                capturePhoto();
                autoCaptureTimerRef.current = null;
            }, 300) as unknown as number;
        }

        if (!canAuto) {
            autoCaptureTriggeredRef.current = false;
            if (autoCaptureTimerRef.current) {
                window.clearTimeout(autoCaptureTimerRef.current);
                autoCaptureTimerRef.current = null;
            }
        }
    }, [
        capturedPhoto,
        stream,
        faceDetected,
        eyesCentered,
        closenessPercent,
        obstructionRatio,
        capturePhoto,
    ]);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    useEffect(() => {
        return () => {
            try {
                const gl = glRef.current;
                if (gl) {
                    if (webglTexRef.current) gl.deleteTexture(webglTexRef.current);
                    if (webglFboRef.current) gl.deleteFramebuffer(webglFboRef.current);
                    if (webglProgRef.current) gl.deleteProgram(webglProgRef.current);
                    if (webglVaoRef.current) gl.deleteVertexArray(webglVaoRef.current);
                    if (webglVboRef.current) gl.deleteBuffer(webglVboRef.current);
                }
            } catch { }
            glRef.current = null;
            webglTexRef.current = null;
            webglFboRef.current = null;
            webglProgRef.current = null;
            webglVaoRef.current = null;
            webglVboRef.current = null;
            if (procCanvasRef.current) procCanvasRef.current.width = 0;
            procCanvasRef.current = null;
        };
    }, []);

    return {
        videoRef,
        canvasRef,
        stream,
        capturedPhoto,
        error,
        isUploading,
        isClient,
        cameraLoading,
        faceDetected,
        faceTooFar,
        eyesCentered,
        closenessPercent,
        obstructionRatio,
        eyeFeatureRatio,
        lastBoxSkin,
        targetSkin,
        startCamera,
        stopCamera,
        capturePhoto,
        retakePhoto,
        setIsUploading,
        MIN_EYE_RATIO,
        MAX_OBSTRUCTION,
    };
}
