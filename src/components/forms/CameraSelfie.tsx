"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { CameraIcon, ArrowPathIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "../ui/core/Button";
// Using plain <img> for data-url previews; next/image is not used here
import { Box, Typography } from "../ui/core";
import Image from "next/image";

interface CameraSelfieProps {
    onPhotoCapture: (photo: File) => void;
    onCancel?: () => void;
}

export default function CameraSelfie({ onPhotoCapture, onCancel }: CameraSelfieProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // WebGL2 processing refs (offscreen)
    const procCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const glRef = useRef<WebGL2RenderingContext | null>(null);
    const webglTexRef = useRef<WebGLTexture | null>(null);
    const webglFboRef = useRef<WebGLFramebuffer | null>(null);
    const webglProgRef = useRef<WebGLProgram | null>(null);
    const webglVaoRef = useRef<WebGLVertexArrayObject | null>(null);
    const webglVboRef = useRef<WebGLBuffer | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    // faceConfidence removed (unused) — kept camera flow minimal
    const [faceTooFar, setFaceTooFar] = useState(false);
    const [eyesCentered, setEyesCentered] = useState(true);
    const [eyeOffsetPercent, setEyeOffsetPercent] = useState(0);
    const [closenessPercent, setClosenessPercent] = useState(0);
    const [lastBoxSkin, setLastBoxSkin] = useState<number | null>(null);
    const [targetSkin, setTargetSkin] = useState<number | null>(null);
    const [obstructionRatio, setObstructionRatio] = useState(0);
    const [eyeFeatureRatio, setEyeFeatureRatio] = useState(0);
    // auto-capture control: ensure we only auto-capture once per green-state entry
    const autoCaptureTriggeredRef = useRef(false);
    const autoCaptureTimerRef = useRef<number | null>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        void setTargetSkin;
    }, [lastBoxSkin, targetSkin, setTargetSkin]);

    const MIN_EYE_RATIO = 0.03;
    const MAX_OBSTRUCTION = 0.08;

    // downscale size for fast GPU readback (tunable)
    const PROC_W = 128;
    const PROC_H = 96;

    // Throttle/debounce helper for detection to reduce CPU/GPU churn
    type ThrottledFn = (() => void) & { cancel?: () => void };
    const detectFaceThrottleRef = useRef<ThrottledFn | null>(null);
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
            if (glRef.current) return; // already init
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

            // Fullscreen quad
            const vao = gl.createVertexArray();
            gl.bindVertexArray(vao);

            const verts = new Float32Array([
                // x, y, u, v
                -1, -1, 0, 0,
                1, -1, 1, 0,
                -1, 1, 0, 1,
                -1, 1, 0, 1,
                1, -1, 1, 0,
                1, 1, 1, 1
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

            // create texture and framebuffer (render target)
            const tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            const targetTex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, targetTex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, PROC_W, PROC_H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            const fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTex, 0);

            webglTexRef.current = tex;
            webglFboRef.current = fbo;

            // Note: procCanvasRef is kept off-DOM for security/privacy
            // (we intentionally don't append it to document.body)

            // unbind
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindVertexArray(null);
        } catch (e) {
            // If anything fails, disable GL path
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

        // If WebGL2 is available, use GPU path: upload video into texture, render to small FBO and readPixels
        const gl = glRef.current;
        if (gl && procCanvasRef.current && webglProgRef.current && webglTexRef.current && webglFboRef.current) {
            try {
                // bind program and FBO
                gl.bindFramebuffer(gl.FRAMEBUFFER, webglFboRef.current);
                gl.viewport(0, 0, PROC_W, PROC_H);
                gl.useProgram(webglProgRef.current as WebGLProgram);

                // upload video frame to texture
                gl.bindTexture(gl.TEXTURE_2D, webglTexRef.current);
                // flip Y because video is mirrored later when capturing
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

                // draw quad into FBO
                gl.bindVertexArray(webglVaoRef.current);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, webglTexRef.current);
                const loc = gl.getUniformLocation(webglProgRef.current as WebGLProgram, 'u_tex');
                gl.uniform1i(loc, 0);
                gl.drawArrays(gl.TRIANGLES, 0, 6);

                // read back small RGBA buffer
                const readBuf = new Uint8Array(PROC_W * PROC_H * 4);
                gl.readPixels(0, 0, PROC_W, PROC_H, gl.RGBA, gl.UNSIGNED_BYTE, readBuf);

                // simple CPU pass over downsampled data to compute metrics similar to 2D path
                // map center and radius to proc coords
                const faceX = Math.floor(PROC_W * 0.5);
                const faceY = Math.floor(PROC_H * 0.4);
                const faceRadius = Math.min(PROC_W, PROC_H) * 0.15;

                const cSize = Math.floor(faceRadius * 2);
                let skinPixels = 0;
                let darkFeatures = 0;
                let darkUpper = 0;
                let darkLower = 0;
                let eyeFeatures = 0;
                let eyeFeatureXSum = 0;
                let eyeFeatureCount = 0;
                let symmetryScore = 0;
                let obstructionPixels = 0;
                let circularPixelCount = 0;
                let avgBrightness = 0;

                for (let y = 0; y < cSize; y++) {
                    for (let x = 0; x < cSize; x++) {
                        const dx = x - faceRadius;
                        const dy = y - faceRadius;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance <= faceRadius) {
                            // remap x,y into proc image coords centered around faceX,faceY
                            const px = Math.max(0, Math.min(PROC_W - 1, Math.floor(faceX - faceRadius + x)));
                            const py = Math.max(0, Math.min(PROC_H - 1, Math.floor(faceY - faceRadius + y)));
                            const i = (py * PROC_W + px) * 4;
                            const r = readBuf[i];
                            const g = readBuf[i + 1];
                            const b = readBuf[i + 2];
                            const gray = (r + g + b) / 3;
                            circularPixelCount++;
                            avgBrightness += gray;
                            if (r > g && r > b && r > 80 && g > 50 && g < 180 && b > 30 && b < 150) skinPixels++;
                            if (gray < 60) {
                                const isUpperHalf = y < faceRadius;
                                if (isUpperHalf) {
                                    darkFeatures++;
                                    darkUpper++;
                                } else {
                                    darkLower++;
                                }
                            }
                            const eyeUpperBound = faceRadius * 0.7;
                            // compute localAvg using 3x3 neighborhood in proc image
                            let localSum = 0;
                            let localCount = 0;
                            for (let ny = Math.max(0, py - 1); ny <= Math.min(PROC_H - 1, py + 1); ny++) {
                                for (let nx = Math.max(0, px - 1); nx <= Math.min(PROC_W - 1, px + 1); nx++) {
                                    const ni = (ny * PROC_W + nx) * 4;
                                    localSum += (readBuf[ni] + readBuf[ni + 1] + readBuf[ni + 2]) / 3;
                                    localCount++;
                                }
                            }
                            const localAvg = localCount > 0 ? localSum / localCount : gray;
                            const isDarkRelative = gray < Math.min(60, localAvg * 0.85);
                            const isUpperRegion = y < eyeUpperBound;
                            if (isUpperRegion && isDarkRelative) {
                                eyeFeatures++;
                                eyeFeatureXSum += x;
                                eyeFeatureCount++;
                            }
                            const isBright = gray > 220;
                            const isDark = gray < 30;
                            if (isBright || isDark) obstructionPixels++;
                            if (x < faceRadius) {
                                const mirrorX = cSize - 1 - x;
                                const mirrorPx = Math.max(0, Math.min(PROC_W - 1, Math.floor(faceX - faceRadius + mirrorX)));
                                const mirrorI = (py * PROC_W + mirrorPx) * 4;
                                const mirrorGray = (readBuf[mirrorI] + readBuf[mirrorI + 1] + readBuf[mirrorI + 2]) / 3;
                                const diff = Math.abs(gray - mirrorGray);
                                symmetryScore += (50 - Math.min(diff, 50)) / 50;
                            }
                        }
                    }
                }

                if (circularPixelCount === 0) return;

                avgBrightness = avgBrightness / circularPixelCount;
                const skinRatio = skinPixels / circularPixelCount;
                const featureRatio = darkFeatures / circularPixelCount;
                const darkUpperRatio = darkUpper / circularPixelCount;
                const darkLowerRatio = darkLower / circularPixelCount;
                const eyeRatio = eyeFeatures / circularPixelCount;
                const obstructionRatio = obstructionPixels / circularPixelCount;
                const symmetryRatio = symmetryScore / (circularPixelCount / 3);

                // Proximity heuristic: estimate closeness from overall skin ratio in proc image center box
                let centerBoxClose = true;
                let currentClosenessPercent: number | null = null;
                try {
                    // sample a center box in proc coords
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
                            if (r > g && r > b && r > 80 && g > 40 && b > 30) boxSkin++;
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
                        // For calibrated target require even closer (stricter)
                        centerBoxClose = percentRel >= 80; // tightened from 95 -> 98
                    } else {
                        const minSkin = 0.08;
                        const maxSkin = 0.35;
                        const raw = Math.max(0, Math.min(1, (boxSkinRatio - minSkin) / (maxSkin - minSkin)));
                        const percent = Math.round(raw * 100);
                        currentClosenessPercent = percent;
                        setClosenessPercent(percent);
                        // Tighten uncalibrated requirement as well
                        centerBoxClose = percent >= 80; // tightened from 85 -> 90
                    }
                    setFaceTooFar(!centerBoxClose);
                } catch {
                    centerBoxClose = true;
                }

                const skinFactor = Math.min(skinRatio * 4, 1);
                const featureFactor = Math.min(featureRatio * 10, 1);
                const eyeFactor = Math.min(eyeRatio * 20, 1);
                const brightnessFactor = avgBrightness > 50 && avgBrightness < 200 ? 1 : 0;
                const symmetryFactor = Math.min(symmetryRatio * 2, 1);
                const obstructionFactor = obstructionRatio < 0.1 ? 1 : 0;

                const confidence = (
                    skinFactor * 0.25 +
                    featureFactor * 0.20 +
                    eyeFactor * 0.30 +
                    brightnessFactor * 0.15 +
                    symmetryFactor * 0.05 +
                    obstructionFactor * 0.05
                );

                // require both upper (eyes) and lower (nose/mouth) dark features so a nearby hand doesn't pass
                const MIN_DARK_HALF_RATIO = 0.005; // tunable
                const detected = (
                    confidence > 0.45 &&
                    obstructionRatio < 0.15 &&
                    centerBoxClose &&
                    skinRatio >= 0.15 &&
                    symmetryRatio >= 0.40 &&
                    eyeRatio >= MIN_EYE_RATIO &&
                    darkUpperRatio >= MIN_DARK_HALF_RATIO &&
                    darkLowerRatio >= MIN_DARK_HALF_RATIO &&
                    (currentClosenessPercent ?? 0) >= 75 // allow slightly farther
                );

                setFaceDetected(detected);
                setFaceTooFar(!centerBoxClose);
                setObstructionRatio(obstructionRatio);
                setEyeFeatureRatio(eyeRatio);

                if (eyeFeatureCount > 0) {
                    const avgX = eyeFeatureXSum / eyeFeatureCount;
                    const centerX = faceRadius;
                    const offset = (avgX - centerX) / faceRadius;
                    const offsetPercent = Math.round(Math.abs(offset) * 100);
                    const centered = Math.abs(offset) <= 0.18;
                    setEyesCentered(centered);
                    setEyeOffsetPercent(offsetPercent);
                } else {
                    setEyesCentered(false);
                    setEyeOffsetPercent(100);
                }

                // unbind fbo
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.bindVertexArray(null);
                gl.bindTexture(gl.TEXTURE_2D, null);
                return;
            } catch (err) {
                // If WebGL path fails for any reason, fall back to 2D path below
                console.warn('WebGL processing failed, falling back to 2D path', err);
            }
        }

        // --- fallback to original 2D canvas processing ---
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
            const faceY = Math.floor(canvas.height * 0.4);
            const faceRadius = Math.min(canvas.width, canvas.height) * 0.15;
            const circularData = context.getImageData(
                faceX - faceRadius,
                faceY - faceRadius,
                faceRadius * 2,
                faceRadius * 2
            );
            const cData = circularData.data;
            const cSize = faceRadius * 2;

            let skinPixels = 0;
            let darkFeatures = 0;
            let darkUpper = 0;
            let darkLower = 0;
            let eyeFeatures = 0;
            // For centering detection
            let eyeFeatureXSum = 0;
            let eyeFeatureCount = 0;
            let symmetryScore = 0;
            let obstructionPixels = 0;
            let circularPixelCount = 0;
            let avgBrightness = 0;

            // Analyze pixels in circular pattern
            for (let y = 0; y < cSize; y++) {
                for (let x = 0; x < cSize; x++) {
                    const dx = x - faceRadius;
                    const dy = y - faceRadius;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Only analyze pixels within the circle
                    if (distance <= faceRadius) {
                        const i = (y * cSize + x) * 4;
                        if (i < cData.length) {
                            const r = cData[i];
                            const g = cData[i + 1];
                            const b = cData[i + 2];
                            const gray = (r + g + b) / 3;

                            circularPixelCount++;
                            avgBrightness += gray;

                            // Detect skin-like colors (warm tones)
                            if (r > g && r > b && r > 80 && r < 220 &&
                                g > 50 && g < 180 && b > 30 && b < 150) {
                                skinPixels++;
                            }

                            // Detect dark features (eyes, nose, mouth)
                            if (gray < 60) {
                                const isUpperHalf = y < faceRadius;
                                if (isUpperHalf) {
                                    darkFeatures++;
                                    darkUpper++;
                                } else {
                                    darkLower++;
                                }
                            }

                            // Detect eyes specifically using a 3x3 local neighborhood average
                            // and a relative-darkness test so it works better across skin tones
                            // and lighting conditions.
                            let localAvg = gray;
                            try {
                                let localSum = 0;
                                let localCount = 0;
                                for (let ny = Math.max(0, y - 1); ny <= Math.min(cSize - 1, y + 1); ny++) {
                                    for (let nx = Math.max(0, x - 1); nx <= Math.min(cSize - 1, x + 1); nx++) {
                                        const ni = (ny * cSize + nx) * 4;
                                        if (ni < cData.length) {
                                            localSum += (cData[ni] + cData[ni + 1] + cData[ni + 2]) / 3;
                                            localCount++;
                                        }
                                    }
                                }
                                if (localCount > 0) localAvg = localSum / localCount;
                            } catch {
                                // fall back to single pixel brightness
                                localAvg = gray;
                            }

                            // eyes are typically darker than their immediate neighborhood and
                            // appear in the upper portion of the circular face crop
                            const eyeUpperBound = faceRadius * 0.7;
                            const isDarkRelative = gray < Math.min(60, localAvg * 0.85);
                            const isUpperRegion = y < eyeUpperBound;
                            if (isUpperRegion && isDarkRelative) {
                                eyeFeatures++;
                                // accumulate approximate x position within circular crop
                                eyeFeatureXSum += x;
                                eyeFeatureCount++;
                            }

                            // Detect potential obstructions (very dark or very bright pixels)
                            const isBright = gray > 220;
                            const isDark = gray < 30;
                            if (isBright || isDark) {
                                obstructionPixels++;
                            }

                            // Check symmetry (compare left and right sides)
                            if (x < faceRadius) {
                                const mirrorX = cSize - 1 - x;
                                const mirrorI = (y * cSize + mirrorX) * 4;
                                if (mirrorI < cData.length) {
                                    const mirrorGray = (cData[mirrorI] + cData[mirrorI + 1] + cData[mirrorI + 2]) / 3;
                                    const diff = Math.abs(gray - mirrorGray);
                                    symmetryScore += (50 - Math.min(diff, 50)) / 50;
                                }
                            }
                        }
                    }
                }
            }

            if (circularPixelCount === 0) return;

            avgBrightness = avgBrightness / circularPixelCount;
            const skinRatio = skinPixels / circularPixelCount;
            const featureRatio = darkFeatures / circularPixelCount;
            const eyeRatio = eyeFeatures / circularPixelCount;
            const obstructionRatio = obstructionPixels / circularPixelCount;
            const symmetryRatio = symmetryScore / (circularPixelCount / 3);
            const darkUpperRatio = darkUpper / circularPixelCount;
            const darkLowerRatio = darkLower / circularPixelCount;

            // Proximity heuristic: sample a larger central box to estimate how much of the frame is face
            let centerBoxClose = true;
            // will hold the closeness percent computed synchronously for this frame
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
                    // skin-like heuristic (broad)
                    if (r > g && r > b && r > 80 && g > 40 && b > 30) boxSkin++;
                    boxTotal++;
                }
                const boxSkinRatio = boxTotal > 0 ? boxSkin / boxTotal : 0;
                setLastBoxSkin(boxSkinRatio);

                // If user calibrated a target, compute percent relative to it
                // Compute a local closeness percent so we can use it synchronously in detection logic
                currentClosenessPercent = 0;
                if (targetSkin !== null) {
                    const rawRel = boxSkinRatio / Math.max(1e-6, targetSkin);
                    const percentRel = Math.round(Math.max(0, Math.min(1.5, rawRel)) * 100);
                    currentClosenessPercent = percentRel;
                    setClosenessPercent(percentRel);
                    // require ~90% of target to be considered close (were 95)
                    centerBoxClose = percentRel >= 90;
                } else {
                    // Map boxSkinRatio into a 0-100 closeness percent using a reasonable range.
                    // Tweak these min/max values to match the example image; current range is [0.04, 0.25].
                    const minSkin = 0.08;
                    const maxSkin = 0.35;
                    const raw = Math.max(0, Math.min(1, (boxSkinRatio - minSkin) / (maxSkin - minSkin)));
                    const percent = Math.round(raw * 100);
                    currentClosenessPercent = percent;
                    setClosenessPercent(percent);
                    if (percent < 75) centerBoxClose = false; // was 85
                    else centerBoxClose = true;
                }
                setFaceTooFar(!centerBoxClose);

                // Conservative post-checks variables are defined after the box sampling
            } catch {
                // ignore sampling errors and assume not too far
                centerBoxClose = true;
            }

            // Calculate face confidence based on multiple factors
            const skinFactor = Math.min(skinRatio * 4, 1); // Good skin detection
            const featureFactor = Math.min(featureRatio * 10, 1); // Some dark features expected
            const eyeFactor = Math.min(eyeRatio * 20, 1); // Eye detection is crucial
            const brightnessFactor = avgBrightness > 50 && avgBrightness < 200 ? 1 : 0; // Good lighting
            const symmetryFactor = Math.min(symmetryRatio * 2, 1); // Face symmetry
            const obstructionFactor = obstructionRatio < 0.1 ? 1 : 0; // No major obstructions

            const confidence = (
                skinFactor * 0.25 +
                featureFactor * 0.20 +
                eyeFactor * 0.30 +
                brightnessFactor * 0.15 +
                symmetryFactor * 0.05 +
                obstructionFactor * 0.05
            );

            // Conservative thresholds that must pass in addition to the computed confidence.
            // requiredCloseness removed (unused)

            // require closeness for detection (user must come nearer)
            // use the per-frame computed closeness percent when available; otherwise fall back to centerBoxClose
            const MIN_DARK_HALF_RATIO = 0.005; // tunable
            const detected = (
                confidence > 0.45 &&
                obstructionRatio < 0.15 &&
                centerBoxClose &&
                skinRatio >= 0.15 &&
                symmetryRatio >= 0.40 &&
                eyeRatio >= MIN_EYE_RATIO &&
                darkUpperRatio >= MIN_DARK_HALF_RATIO &&
                darkLowerRatio >= MIN_DARK_HALF_RATIO &&
                (currentClosenessPercent ?? 0) >= 75 // allow slightly farther (was 85)
            );



            setFaceDetected(detected);
            // face confidence tracking removed
            setFaceTooFar(!centerBoxClose);
            setObstructionRatio(obstructionRatio); // New state update
            setEyeFeatureRatio(eyeRatio); // New state update

            // compute eye centering: find average x of eye features and compare to center
            if (eyeFeatureCount > 0) {
                const avgX = eyeFeatureXSum / eyeFeatureCount; // in 0..cSize
                const centerX = faceRadius; // center of circular crop
                const offset = (avgX - centerX) / faceRadius; // -1..1
                const offsetPercent = Math.round(Math.abs(offset) * 100);
                // Consider centered if within 18% of radius (tunable)
                const centered = Math.abs(offset) <= 0.18;
                setEyesCentered(centered);
                setEyeOffsetPercent(offsetPercent);
            } else {
                // if no eye features, mark as not centered
                setEyesCentered(false);
                setEyeOffsetPercent(100);
            }
        } catch (error) {
            console.error('Face detection error:', error);
        }
    }, [stream, targetSkin]);

    useEffect(() => {
        if (!stream || !videoRef.current) return;

        // create or refresh throttled function for detectFace
        detectFaceThrottleRef.current = createThrottled(detectFace, 250);

        const interval = window.setInterval(() => {
            if (detectFaceThrottleRef.current) {
                detectFaceThrottleRef.current();
            }
        }, 200);

        return () => {
            clearInterval(interval);
            // cancel pending throttled invocation
            if (detectFaceThrottleRef.current && detectFaceThrottleRef.current.cancel) {
                detectFaceThrottleRef.current.cancel();
            }
            detectFaceThrottleRef.current = null;
        };
    }, [stream, detectFace, createThrottled]);

    const startCamera = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640, min: 480 },
                    height: { ideal: 480, min: 360 }
                },
                audio: false
            });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);

                // Initialize WebGL2 processing path if available
                try {
                    initWebGL();
                } catch {
                    // ignore
                }

                const video = videoRef.current;

                const handleCanPlay = () => {
                    video.play().catch(() => {
                        // Error handling is done in the catch block below
                    });
                };

                if (video.readyState >= 3) {
                    handleCanPlay();
                } else {
                    video.addEventListener('canplay', handleCanPlay, { once: true });
                }
            }
        } catch (err) {
            if (err instanceof Error) {
                const errorMessage = err.name === 'NotAllowedError'
                    ? 'دسترسی به دوربین رد شد. لطفاً دسترسی را اجازه دهید.'
                    : err.name === 'NotFoundError'
                        ? 'دوربین یافت نشد. لطفاً از وجود دوربین اطمینان حاصل کنید.'
                        : 'خطا در دسترسی به دوربین. لطفاً دوباره تلاش کنید.';
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    }, [stream, initWebGL]);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
            });
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        // Free WebGL resources when camera stops to avoid leaking GPU resources
        try {
            const gl = glRef.current;
            if (gl) {
                // delete textures
                if (webglTexRef.current) gl.deleteTexture(webglTexRef.current);
                if (webglFboRef.current) gl.deleteFramebuffer(webglFboRef.current);
                if (webglProgRef.current) gl.deleteProgram(webglProgRef.current);
                if (webglVaoRef.current) gl.deleteVertexArray(webglVaoRef.current);
                if (webglVboRef.current) gl.deleteBuffer(webglVboRef.current);
            }
        } catch {
            // ignore cleanup errors
        }
        glRef.current = null;
        webglTexRef.current = null;
        webglFboRef.current = null;
        webglProgRef.current = null;
        webglVaoRef.current = null;
        webglVboRef.current = null;
        if (procCanvasRef.current) procCanvasRef.current.width = 0; // neutralize offscreen canvas
        procCanvasRef.current = null;
    }, [stream]);

    const compressImage = useCallback((canvas: HTMLCanvasElement, maxWidth = 800, maxHeight = 600, quality = 0.7): string => {
        const compressCanvas = document.createElement('canvas');
        const compressContext = compressCanvas.getContext('2d');

        if (!compressContext) return canvas.toDataURL('image/jpeg', quality);

        let { width, height } = canvas;

        if (width > height) {
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }
        }
        compressCanvas.width = width;
        compressCanvas.height = height;
        compressContext.drawImage(canvas, 0, 0, width, height);
        return compressCanvas.toDataURL('image/jpeg', quality);
    }, []);

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

        // Ensure video is playing / has dimensions
        try {
            if (video.readyState < 2) {
                // try to play to get a current frame; ignore any play errors
                video.play().catch(() => { });
            }
        } catch {
            // ignore
        }

        // prefer intrinsic video dimensions but fall back to client bounding box
        const vw = video.videoWidth || Math.round(video.clientWidth) || 640;
        const vh = video.videoHeight || Math.round(video.clientHeight) || 480;
        if (vw === 0 || vh === 0) {
            console.warn('capturePhoto: video dimensions are zero, using fallback 640x480');
        }

        canvas.width = vw;
        canvas.height = vh;
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Mirror the video into the canvas (user-facing camera is usually mirrored)
        context.save();
        try {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
            // draw the video frame; some browsers may throw if video not ready
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
        } catch (err) {
            // Fallback: try using createImageBitmap for more robust frame extraction
            console.warn('drawImage failed, attempting createImageBitmap fallback', err);
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const bitmap = await (window as any).createImageBitmap(video);
                context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
                try { bitmap.close?.(); } catch { }
            } catch (err2) {
                console.error('createImageBitmap fallback failed:', err2);
            }
        } finally {
            context.restore();
        }

        const compressedDataUrl = compressImage(canvas, 600, 600, 0.8);
        setCapturedPhoto(compressedDataUrl);
        setTimeout(() => {
            stopCamera();
        }, 200);

    }, [stream, stopCamera, compressImage]);

    const confirmPhoto = useCallback(() => {
        if (!capturedPhoto) return;

        // Convert compressed data URL to blob and file
        fetch(capturedPhoto)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], 'selfie_compressed.jpg', { type: 'image/jpeg' });
                console.log('Final compressed file size:', (file.size / 1024).toFixed(1) + 'KB');
                onPhotoCapture(file);
            })
            .catch(err => {
                console.error('Error creating compressed file:', err);
                // Fallback to canvas blob if fetch fails
                if (canvasRef.current) {
                    canvasRef.current.toBlob((blob) => {
                        if (blob) {
                            const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
                            onPhotoCapture(file);
                        }
                    }, 'image/jpeg', 0.7);
                }
            });
    }, [capturedPhoto, onPhotoCapture]);

    // Retake photo
    const retakePhoto = useCallback(() => {
        setCapturedPhoto(null);
        startCamera();
    }, [startCamera]);

    useEffect(() => {
        if (stream && videoRef.current) {
            console.log('Stream updated, refreshing video...');
            const video = videoRef.current;

            if (video.srcObject !== stream) {
                video.srcObject = stream;
            }

            const playVideo = () => {
                video.play()
            };

            if (video.readyState >= 2) {
                playVideo();
            } else {
                video.addEventListener('loadeddata', playVideo, { once: true });
            }
        }
    }, [stream]);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    // Ensure WebGL resources are freed on unmount as well
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
            } catch {
                // ignore
            }
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

    // Auto-capture when conditions are green (only once per green-entry)
    useEffect(() => {
        const canAuto = !capturedPhoto && stream && faceDetected && eyesCentered && closenessPercent > 70 && obstructionRatio < 0.15;
        if (canAuto && !autoCaptureTriggeredRef.current) {
            // small debounce to avoid instant snap on transient green; give user 300ms
            autoCaptureTriggeredRef.current = true;
            if (autoCaptureTimerRef.current) window.clearTimeout(autoCaptureTimerRef.current);
            autoCaptureTimerRef.current = window.setTimeout(() => {
                capturePhoto();
                autoCaptureTimerRef.current = null;
            }, 300) as unknown as number;
        }

        // reset trigger when conditions go away so we can auto-capture again next time
        if (!canAuto) {
            autoCaptureTriggeredRef.current = false;
            if (autoCaptureTimerRef.current) {
                window.clearTimeout(autoCaptureTimerRef.current);
                autoCaptureTimerRef.current = null;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [capturedPhoto, stream, faceDetected, eyesCentered, closenessPercent, obstructionRatio]);


    if (error) {
        return (
            <Box className="max-w-md mx-auto text-center space-y-4">
                <Box className="bg-error-50 border border-error-200 rounded-xl p-6">
                    <CameraIcon className="h-12 w-12 text-error-400 mx-auto mb-4" />
                    <Typography variant="h3" className="text-lg font-semibold text-error-800 mb-2">خطا در دسترسی به دوربین</Typography>
                    <Typography variant="body1" className="text-error-700 text-sm mb-4">{error}</Typography>
                    <Box className="space-y-2">
                        <Typography variant="body1" className="text-xs text-error-600">لطفاً:</Typography>
                        <ul className="text-xs text-error-600 list-disc list-inside text-right">
                            <li>دسترسی دوربین را در تنظیمات مرورگر فعال کنید</li>
                            <li>از https استفاده کنید</li>
                            <li>دوربین توسط برنامه دیگری استفاده نشود</li>
                        </ul>
                    </Box>
                    <Box className="flex space-x-3 space-x-reverse mt-4">
                        <Button onClick={startCamera} size="sm" variant="outline">
                            تلاش مجدد
                        </Button>
                        {onCancel && (
                            <Button onClick={onCancel} size="sm" variant="destructive">
                                انصراف
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>
        );
    }

    // Show loading state until client-side hydration
    if (!isClient) {
        return (
            <Box className="max-w-md mx-auto space-y-4">
                <Box className="text-center mb-4">
                    <Typography variant="h2" className="text-xl font-bold text-gray-800">عکس سلفی</Typography>
                    <Typography variant="body1" className="text-gray-600 text-sm">برای احراز هویت، عکس سلفی خود را بگیرید</Typography>
                </Box>
                <Box className="relative bg-black rounded-full overflow-hidden aspect-square w-80 h-80 mx-auto">
                    <Box className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-white space-y-4">
                        <CameraIcon className="h-16 w-16 text-gray-400" />
                        <Box className="text-center">
                            <Typography variant="h3" className="text-lg font-semibold mb-2">آماده عکس‌گیری</Typography>
                            <Typography variant="body1" className="text-sm text-gray-300 mb-4">در حال بارگذاری...</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box className="max-w-md mx-auto space-y-4">

            {capturedPhoto && <Box className="">
                <Box className="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-3">
                    <Typography variant="body1" className="text-white text-xs text-center">
                        عکس خود را بررسی کنید. اگر مناسب است تایید کنید، در غیر این صورت عکس جدید بگیرید.
                    </Typography>
                </Box>
            </Box>}
            <Box className="relative bg-black rounded-full overflow-hidden w-70 h-70 mx-auto">
                {/* Add circular progress */}
                {!capturedPhoto && stream && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90 z-30 pointer-events-none">
                        <circle
                            className="transition-all duration-300"
                            stroke={
                                closenessPercent <= 50
                                    ? 'var(--color-error-500)'
                                    : closenessPercent <= 85
                                        ? 'var(--color-warning-500)'
                                        : 'var(--color-success-500)'
                            }
                            strokeWidth="4"
                            fill="none"
                            r="49%"  // تغییر به 49% برای پوشش کامل لبه
                            cx="50%"
                            cy="50%"
                            style={{
                                strokeDasharray: `${2 * Math.PI * 49}%`,  // محاسبه محیط دایره
                                strokeDashoffset: `${2 * Math.PI * 49 * (1 - closenessPercent / 100)}%`  // محاسبه offset بر اساس درصد
                            }}
                        />
                    </svg>
                )}

                {!capturedPhoto && stream && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90 z-30 pointer-events-none">
                        <circle
                            className="transition-all duration-300"
                            stroke={
                                closenessPercent <= 50
                                    ? 'var(--color-error-500)'
                                    : closenessPercent <= 85
                                        ? 'var(--color-warning-500)'
                                        : 'var(--color-success-500)'
                            }
                            strokeWidth="4"
                            fill="none"
                            r="49%"  // تغییر به 49% برای پوشش کامل لبه
                            cx="50%"
                            cy="50%"
                            style={{
                                strokeDasharray: `${2 * Math.PI * 49}%`,  // محاسبه محیط دایره
                                strokeDashoffset: `${2 * Math.PI * 49 * (1 - closenessPercent / 100)}%`  // محاسبه offset بر اساس درصد
                            }}
                        />
                    </svg>
                )}

                {/* Rest of existing video/camera elements */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`absolute top-0 left-0 w-full h-full object-cover transform -scale-x-100 bg-black z-10 ${stream && !capturedPhoto ? 'opacity-100 visible' : 'opacity-0 invisible'
                        }`}
                    controls={false}
                    disablePictureInPicture
                    disableRemotePlayback
                />

                {/* Eye centering overlay: show crosshair and guideline */}


                {!stream && !capturedPhoto && !isLoading ? (
                    <Box className="absolute inset-0 -bottom-16 bg-gray-900 flex flex-col items-center justify-center text-white space-y-2 z-20">
                        <CameraIcon className="h-16 w-16 text-gray-400" />
                        <Button onClick={startCamera} className="bg-primary hover:bg-primary-700">
                            <CameraIcon className="h-5 w-5 ml-2" />
                            روشن کردن دوربین
                        </Button>
                    </Box>
                ) : null}

                {!capturedPhoto ? (
                    isLoading && (
                        <Box className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
                            <Box className="text-white text-center p-4 rounded-xl bg-black bg-opacity-70">
                                <Box className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-3"></Box>
                                <Box className="bg-white p-1">
                                    <Typography variant="body1" className="text-sm text-center ">در حال راه‌اندازی دوربین...</Typography>
                                    <Typography variant="body1" className="text-xs mt-2  text-center">لطفاً کمی صبر کنید</Typography>
                                </Box>
                            </Box>
                        </Box>
                    )

                ) : (
                    <Box className="relative w-full h-full z-20">
                        {/* Use a plain img for data-url previews to avoid next/image optimization issues */}
                        <Image
                            src={capturedPhoto ?? ''}
                            alt="Captured selfie"
                            className="w-full h-full object-cover rounded-full transform scale-x-100"
                            width={300}
                            height={300}
                        />

                        <Box className="absolute inset-0 border-2 border-white border-opacity-20 rounded-full pointer-events-none"></Box>
                    </Box>
                )}
                {!capturedPhoto && stream && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90 z-30 pointer-events-none">
                        <circle
                            className="transition-all duration-300"
                            stroke={
                                closenessPercent <= 50
                                    ? 'var(--color-error-500)'
                                    : closenessPercent <= 85
                                        ? 'var(--color-warning-500)'
                                        : 'var(--color-success-500)'
                            }
                            strokeWidth="4"
                            fill="none"
                            r="49%"  // تغییر به 49% برای پوشش کامل لبه
                            cx="50%"
                            cy="50%"
                            style={{
                                strokeDasharray: `${2 * Math.PI * 49}%`,  // محاسبه محیط دایره
                                strokeDashoffset: `${2 * Math.PI * 49 * (1 - closenessPercent / 100)}%`  // محاسبه offset بر اساس درصد
                            }}
                        />
                    </svg>
                )}
                {/* Hidden canvas for photo capture */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </Box>
            {capturedPhoto && (
                <Box className="flex justify-center gap-4">
                    <Button
                        onClick={retakePhoto}
                        className="w-fu  px-5 py-3 flex items-center justify-center bg-success hover:bg-primary-300"
                    >
                        <ArrowPathIcon className="h-6 w-6 text-white" />
                        <Typography variant="body1" className=" text-xs font-medium text-white">
                            عکس جدید
                        </Typography>
                    </Button>


                </Box>
            )}
            {/* Face detection status - outside the camera frame */}
            {!capturedPhoto && stream && closenessPercent !== 100 && (
                <Box className="text-center space-y-3">
                    <Typography variant="body1" className={`text-sm font-medium transition-colors duration-300 text-center
                        ${!faceDetected && "text-red-500"}
                        ${faceDetected && closenessPercent > 50 && "text-green-500"}`}>
                        {!faceDetected && (
                            faceTooFar ? 'لطفاً نزدیک‌تر بیایید' :
                                obstructionRatio >= MAX_OBSTRUCTION ? 'عدم وضوح ' :
                                    eyeFeatureRatio < MIN_EYE_RATIO ? 'لطفاً مطمئن شوید چشم‌ها و ابروها به وضوح دیده می‌شوند' :
                                        'صورت خود را در مقابل دوربین قرار دهید'
                        )}
                    </Typography>
                </Box>
            )}

            {/* Capture button - outside camera frame, below status */}
            {!capturedPhoto && stream && !isLoading && (
                <Box className="flex flex-col items-center space-y-2">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('External photo button clicked! Face detected:', faceDetected);
                            capturePhoto();
                        }}
                        disabled={closenessPercent !== 100 || obstructionRatio >= 0.15} // Disable if obstructionRatio is too high
                        className={`w-20 h-20 rounded-full border-4 transition-all duration-300 ${closenessPercent === 100 && obstructionRatio < 0.15
                            ? 'bg-green-500 border-green-600 hover:bg-green-600 shadow-lg hover:shadow-xl active:scale-95'
                            : 'bg-gray-300  cursor-not-allowed opacity-50'
                            }`}
                        title={closenessPercent === 100 && obstructionRatio < 0.15 ? 'عکس بگیرید' : 'ابتدا نزدیکی را به 100٪ برسانید و مطمئن شوید که هیچ مانعی وجود ندارد'}
                    >
                        <Box className={`w-12 h-12 rounded-full mx-auto transition-colors ${closenessPercent === 100 && obstructionRatio < 0.15 ? 'bg-white' : 'bg-gray-500'
                            }`} />
                    </button>


                </Box>
            )}
            <Box className="bg-gray-100  rounded-xl p-4">
                <Typography variant="body1" className="font-semibold text-gray-900 mb-2 text-center">راهنمای عکس‌برداری:</Typography>
                {!capturedPhoto ? (
                    <ul className="text-sm text-gray-800 space-y-1">
                        <li>• صورت خود را کاملاً در قاب قرار دهید</li>
                        <li>• از نور کافی استفاده کنید</li>
                        <li>• عینک آفتابی نداشته باشید</li>
                        <li>• مستقیم به دوربین نگاه کنید</li>
                        <li>• منتظر بمانید تا صورت شما تشخیص داده شود</li>
                        <li>• روی دکمه سبز کلیک کنید تا عکس بگیرید</li>
                    </ul>
                ) : (
                    <ul className="text-sm text-error-800 space-y-1">
                        <li>• عکس خود را بررسی کنید</li>
                        <li>• اگر عکس مناسب است، روی «تایید» کلیک کنید</li>
                        <li>• برای گرفتن عکس جدید، روی «عکس جدید» کلیک کنید</li>
                    </ul>
                )}
            </Box>

            <Box className="w-full flex gap-2 items-center">
                <Button
                    onClick={onCancel}
                    variant="destructive"
                    className="w-full flex justify-center gapo-3 px-5 py-3 items-center text-white"
                >
                    <XMarkIcon className="w-5 h-5 text-white" />
                    انصراف
                </Button>
                <Button
                    variant="primary"
                    onClick={confirmPhoto}
                    className="  text-white  gap-3 px-5 py-3 flex items-center justify-center  w-full bg-primary"
                >
                    <CheckIcon className="h-5 w-5" />
                    <Typography variant="body1" className="text-white text-xs font-medium">
                        تایید
                    </Typography>
                </Button>
            </Box>
        </Box>
    );
}
