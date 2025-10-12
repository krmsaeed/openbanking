'use client';

import { useUser } from '@/contexts/UserContext';
import { ArrowPathIcon, CameraIcon, CheckIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Box, Typography } from '../ui/core';
import { Button } from '../ui/core/Button';
import LoadingButton from '../ui/core/LoadingButton';
export default function CameraSelfie() {
    const { userData, setUserData } = useUser();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
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

    const PROC_W = 128;
    const PROC_H = 96;

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
                            if (r > g && r > b && r > 80 && g > 50 && g < 180 && b > 30 && b < 150)
                                skinPixels++;
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
                                const mirrorPx = Math.max(
                                    0,
                                    Math.min(PROC_W - 1, Math.floor(faceX - faceRadius + mirrorX))
                                );
                                const mirrorI = (py * PROC_W + mirrorPx) * 4;
                                const mirrorGray =
                                    (readBuf[mirrorI] +
                                        readBuf[mirrorI + 1] +
                                        readBuf[mirrorI + 2]) /
                                    3;
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
                        centerBoxClose = percentRel >= 80;
                    } else {
                        const minSkin = 0.08;
                        const maxSkin = 0.35;
                        const raw = Math.max(
                            0,
                            Math.min(1, (boxSkinRatio - minSkin) / (maxSkin - minSkin))
                        );
                        const percent = Math.round(raw * 100);
                        currentClosenessPercent = percent;
                        setClosenessPercent(percent);
                        centerBoxClose = percent >= 80;
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

                const confidence =
                    skinFactor * 0.25 +
                    featureFactor * 0.2 +
                    eyeFactor * 0.3 +
                    brightnessFactor * 0.15 +
                    symmetryFactor * 0.05 +
                    obstructionFactor * 0.05;

                const MIN_DARK_HALF_RATIO = 0.005;
                const detected =
                    confidence > 0.45 &&
                    obstructionRatio < 0.15 &&
                    centerBoxClose &&
                    skinRatio >= 0.15 &&
                    symmetryRatio >= 0.4 &&
                    eyeRatio >= MIN_EYE_RATIO &&
                    darkUpperRatio >= MIN_DARK_HALF_RATIO &&
                    darkLowerRatio >= MIN_DARK_HALF_RATIO &&
                    (currentClosenessPercent ?? 0) >= 75;

                setFaceDetected(detected);
                setFaceTooFar(!centerBoxClose);
                setObstructionRatio(obstructionRatio);
                setEyeFeatureRatio(eyeRatio);

                if (eyeFeatureCount > 0) {
                    const avgX = eyeFeatureXSum / eyeFeatureCount;
                    const centerX = faceRadius;
                    const offset = (avgX - centerX) / faceRadius;
                    const centered = Math.abs(offset) <= 0.18;
                    setEyesCentered(centered);
                } else {
                    setEyesCentered(false);
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
                        const i = (y * cSize + x) * 4;
                        if (i < cData.length) {
                            const r = cData[i];
                            const g = cData[i + 1];
                            const b = cData[i + 2];
                            const gray = (r + g + b) / 3;

                            circularPixelCount++;
                            avgBrightness += gray;

                            if (
                                r > g &&
                                r > b &&
                                r > 80 &&
                                r < 220 &&
                                g > 50 &&
                                g < 180 &&
                                b > 30 &&
                                b < 150
                            ) {
                                skinPixels++;
                            }

                            if (gray < 60) {
                                const isUpperHalf = y < faceRadius;
                                if (isUpperHalf) {
                                    darkFeatures++;
                                    darkUpper++;
                                } else {
                                    darkLower++;
                                }
                            }
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
                            const eyeUpperBound = faceRadius * 0.7;
                            const isDarkRelative = gray < Math.min(60, localAvg * 0.85);
                            const isUpperRegion = y < eyeUpperBound;
                            if (isUpperRegion && isDarkRelative) {
                                eyeFeatures++;
                                eyeFeatureXSum += x;
                                eyeFeatureCount++;
                            }

                            const isBright = gray > 220;
                            const isDark = gray < 30;
                            if (isBright || isDark) {
                                obstructionPixels++;
                            }

                            if (x < faceRadius) {
                                const mirrorX = cSize - 1 - x;
                                const mirrorI = (y * cSize + mirrorX) * 4;
                                if (mirrorI < cData.length) {
                                    const mirrorGray =
                                        (cData[mirrorI] + cData[mirrorI + 1] + cData[mirrorI + 2]) /
                                        3;
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
                    if (r > g && r > b && r > 80 && g > 40 && b > 30) boxSkin++;
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
                    const minSkin = 0.08;
                    const maxSkin = 0.35;
                    const raw = Math.max(
                        0,
                        Math.min(1, (boxSkinRatio - minSkin) / (maxSkin - minSkin))
                    );
                    const percent = Math.round(raw * 100);
                    currentClosenessPercent = percent;
                    setClosenessPercent(percent);
                    if (percent < 75) centerBoxClose = false;
                    else centerBoxClose = true;
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

            const confidence =
                skinFactor * 0.25 +
                featureFactor * 0.2 +
                eyeFactor * 0.3 +
                brightnessFactor * 0.15 +
                symmetryFactor * 0.05 +
                obstructionFactor * 0.05;

            const MIN_DARK_HALF_RATIO = 0.005;
            const detected =
                confidence > 0.45 &&
                obstructionRatio < 0.15 &&
                centerBoxClose &&
                skinRatio >= 0.15 &&
                symmetryRatio >= 0.4 &&
                eyeRatio >= MIN_EYE_RATIO &&
                darkUpperRatio >= MIN_DARK_HALF_RATIO &&
                darkLowerRatio >= MIN_DARK_HALF_RATIO &&
                (currentClosenessPercent ?? 0) >= 75;
            setFaceDetected(detected);
            setFaceTooFar(!centerBoxClose);
            setObstructionRatio(obstructionRatio);
            setEyeFeatureRatio(eyeRatio);

            if (eyeFeatureCount > 0) {
                const avgX = eyeFeatureXSum / eyeFeatureCount;
                const centerX = faceRadius;
                const offset = (avgX - centerX) / faceRadius;
                const centered = Math.abs(offset) <= 0.18;
                setEyesCentered(centered);
            } else {
                setEyesCentered(false);
            }
        } catch (error) {
            console.error('Face detection error:', error);
        }
    }, [stream, targetSkin]);

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
                } catch {}

                const video = videoRef.current;

                const handleCanPlay = () => {
                    video.play().catch(() => {});
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
        } catch {}
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
        (canvas: HTMLCanvasElement, maxWidth = 800, maxHeight = 600, quality = 0.7): string => {
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
                video.play().catch(() => {});
            }
        } catch {}

        const vw = video.videoWidth || Math.round(video.clientWidth) || 640;
        const vh = video.videoHeight || Math.round(video.clientHeight) || 480;
        if (vw === 0 || vh === 0) {
            console.warn('capturePhoto: video dimensions are zero, using fallback 640x480');
        }

        canvas.width = vw;
        canvas.height = vh;
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.save();
        try {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
        } catch (err) {
            console.warn('drawImage failed, attempting createImageBitmap fallback', err);
            try {
                type CreateImageBitmapLike = (src: ImageBitmapSource) => Promise<ImageBitmap>;
                const cib = (window as unknown as { createImageBitmap?: CreateImageBitmapLike })
                    .createImageBitmap;
                if (cib) {
                    const bitmap = await cib(video as unknown as ImageBitmapSource);
                    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
                    try {
                        bitmap.close?.();
                    } catch {}
                }
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
    const handleConfirm = async () => {
        if (!capturedPhoto) {
            toast.error('عکسی برای ارسال وجود ندارد');
            return;
        }

        setIsUploading(true);

        const body = {
            serviceName: 'virtual-open-deposit',
            processId: userData.processId,
            formName: 'GovahInquiry',
            body: {},
        };

        const data = new FormData();
        try {
            let blob: Blob | null = null;
            try {
                const res = await fetch(capturedPhoto);
                blob = await res.blob();
            } catch {
                if (canvasRef.current) {
                    blob = await new Promise<Blob | null>((resolve) => {
                        canvasRef.current!.toBlob((b) => resolve(b), 'image/jpeg', 0.8);
                        setTimeout(() => resolve(null), 2000);
                    });
                }
            }

            if (!blob) {
                toast.error('امکان ایجاد تصویر برای آپلود وجود ندارد');
                return;
            }

            type MaybeCrypto = { crypto?: { randomUUID?: () => string } };
            const maybe = globalThis as unknown as MaybeCrypto;
            const uuid =
                maybe?.crypto && typeof maybe.crypto.randomUUID === 'function'
                    ? maybe.crypto.randomUUID()
                    : Date.now().toString(36);
            const filename = `selfie_${uuid}.jpg`;

            const file = new File([blob], filename, { type: 'image/jpeg' });

            data.append('messageDTO', JSON.stringify(body));
            data.append('files', file);

            await axios.post('/api/bpms/deposit-files', data).then((res) => {
                const { data } = res;
                setUserData({ ...userData, step: 3, randomText: data.body.randomText });
            });
        } catch (err) {
            console.error('upload error', err);
            toast.error('آپلود عکس با مشکل مواجه شد');
        } finally {
            setIsUploading(false);
        }
    };

    const retakePhoto = useCallback(() => {
        setCapturedPhoto(null);
        setCameraLoading(true);
        startCamera();
    }, [startCamera]);

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
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    useEffect(() => {
        setCameraLoading(true);
        startCamera();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            } catch {}
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

    if (error) {
        return (
            <Box className="mx-auto max-w-md space-y-4 text-center">
                <Box className="bg-error-50 border-error-200 rounded-xl border p-6">
                    <CameraIcon className="text-error-400 mx-auto mb-4 h-12 w-12" />
                    <Typography variant="h3" className="text-error-800 mb-2 text-lg font-semibold">
                        خطا در دسترسی به دوربین
                    </Typography>
                    <Typography variant="body1" className="text-error-700 mb-4 text-sm">
                        {error}
                    </Typography>
                    <Box className="space-y-2">
                        <Typography variant="body1" className="text-error-600 text-xs">
                            لطفاً:
                        </Typography>
                        <ul className="text-error-600 list-inside list-disc text-right text-xs">
                            <li>دسترسی دوربین را در تنظیمات مرورگر فعال کنید</li>
                            <li>از https استفاده کنید</li>
                        </ul>
                    </Box>
                    <Box className="mt-4 flex space-x-3 space-x-reverse">
                        <Button onClick={startCamera} size="sm" variant="outline">
                            تلاش مجدد
                        </Button>

                        <Button
                            onClick={() => setUserData({ step: 1 })}
                            size="sm"
                            variant="destructive"
                        >
                            انصراف
                        </Button>
                    </Box>
                </Box>
            </Box>
        );
    }

    if (!isClient) {
        return (
            <Box className="mx-auto max-w-md space-y-4">
                <Box className="mb-4 text-center">
                    <Typography variant="h2" className="text-xl font-bold text-gray-800">
                        عکس سلفی
                    </Typography>
                    <Typography variant="body1" className="text-sm text-gray-600">
                        برای احراز هویت، عکس سلفی خود را بگیرید
                    </Typography>
                </Box>
                <Box className="relative mx-auto aspect-square h-80 w-80 overflow-hidden rounded-full bg-black">
                    <Box className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-gray-900 text-white">
                        <CameraIcon className="h-16 w-16 text-gray-400" />
                        <Box className="text-center">
                            <Typography variant="h3" className="mb-2 text-lg font-semibold">
                                آماده عکس‌گیری
                            </Typography>
                            <Typography variant="body1" className="mb-4 text-sm text-gray-300">
                                در حال بارگذاری...
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box className="mx-auto max-w-md space-y-4">
            <Box className="bg-dark relative mx-auto h-70 w-70 overflow-hidden rounded-full">
                {cameraLoading && (
                    <Box className="absolute inset-0 z-30 flex flex-col items-center justify-center space-y-4 bg-gray-900 text-white">
                        <Box className="border-t-primary-500 h-12 w-12 animate-spin rounded-full border-4 border-gray-300"></Box>
                        <Box className="text-center">
                            <Typography variant="h3" className="mb-2 text-lg font-semibold">
                                در حال روشن کردن دوربین
                            </Typography>
                            <Typography variant="body1" className="text-sm text-gray-300">
                                لطفاً صبر کنید...
                            </Typography>
                        </Box>
                    </Box>
                )}

                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`absolute top-0 left-0 z-10 h-full w-full -scale-x-100 transform bg-black object-cover ${
                        stream && !capturedPhoto && !cameraLoading
                            ? 'visible opacity-100'
                            : 'invisible opacity-0'
                    }`}
                    controls={false}
                    disablePictureInPicture
                    disableRemotePlayback
                />

                {!capturedPhoto ? null : (
                    <Box className="relative z-20 h-full w-full">
                        <Image
                            src={capturedPhoto ?? ''}
                            alt="Captured selfie"
                            className="h-full w-full scale-x-100 transform rounded-full object-cover"
                            width={300}
                            height={300}
                        />

                        <Box className="border-opacity-20 pointer-events-none absolute inset-0 rounded-full border-2 border-white"></Box>
                    </Box>
                )}
                {!capturedPhoto && stream && !cameraLoading && (
                    <svg className="pointer-events-none absolute inset-0 z-30 h-full w-full -rotate-90">
                        <circle
                            className="transition-all duration-300"
                            stroke={
                                closenessPercent === 100 && obstructionRatio < 0.15
                                    ? 'var(--color-success-500)'
                                    : closenessPercent < 80
                                      ? 'var(--color-error-800)'
                                      : 'var(--color-warning-500)'
                            }
                            strokeWidth="4"
                            fill="none"
                            r="49%"
                            cx="50%"
                            cy="50%"
                            style={{
                                strokeDasharray: `${2 * Math.PI * 49}%`,
                                strokeDashoffset: `${2 * Math.PI * 49 * (1 - (closenessPercent === 100 && obstructionRatio < 0.15 ? 100 : Math.min(closenessPercent, 95)) / 100)}%`,
                            }}
                        />
                    </svg>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </Box>
            {capturedPhoto && (
                <Box className="flex justify-center gap-4">
                    <Button
                        onClick={retakePhoto}
                        className="w-fu bg-success-400 hover:bg-primary-300 flex items-center justify-center px-5 py-3 opacity-50 hover:opacity-100"
                    >
                        <ArrowPathIcon className="h-6 w-6 text-white" />
                        <Typography variant="body1" className="text-xs font-medium text-white">
                            عکس جدید
                        </Typography>
                    </Button>
                </Box>
            )}
            {!capturedPhoto && stream && !cameraLoading && closenessPercent <= 80 ? (
                <Box className="h-3 space-y-3 text-center">
                    <Typography
                        variant="body1"
                        className={`text-center text-sm font-medium transition-colors duration-300 ${!faceDetected && 'text-red-500'} ${faceDetected && closenessPercent >= 85 && 'text-green-500'}`}
                    >
                        {!faceDetected &&
                            (faceTooFar
                                ? 'لطفاً نزدیک‌تر بیایید'
                                : obstructionRatio <= MAX_OBSTRUCTION
                                  ? 'عدم وضوح '
                                  : eyeFeatureRatio < MIN_EYE_RATIO
                                    ? ' مطمئن شوید چشم‌ها و ابروها به وضوح دیده می‌شوند'
                                    : 'صورت خود را در مقابل دوربین قرار دهید')}
                    </Typography>
                </Box>
            ) : (
                <Box className="h-3"></Box>
            )}

            {!capturedPhoto && stream && !cameraLoading && (
                <Box className="flex flex-col items-center space-y-2">
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (closenessPercent === 100 && obstructionRatio < 0.15) {
                                capturePhoto();
                            }
                        }}
                        disabled={!(closenessPercent === 100 && obstructionRatio < 0.15)}
                        className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all duration-300 ${
                            closenessPercent === 100 && obstructionRatio < 0.15
                                ? 'bg-success-500 hover:bg-success-600 cursor-pointer text-white shadow-lg hover:shadow-xl active:scale-95'
                                : 'cursor-not-allowed bg-gray-400 text-gray-600 opacity-60'
                        }`}
                    >
                        <CameraIcon className="h-5 w-5" />
                        <Typography variant="body1" className="text-sm font-medium">
                            گرفتن عکس
                        </Typography>
                    </Button>
                </Box>
            )}
            <Box className="rounded-xl bg-gray-200 p-4">
                {!capturedPhoto ? (
                    <>
                        <ul className="text-dark [&_li]:text-dark space-y-1 text-sm">
                            <li>• صورت خود را کاملاً در قاب قرار دهید</li>
                            <li>• مستقیم به دوربین نگاه کنید</li>
                            <li>• منتظر بمانید تا صورت شما تشخیص داده شود</li>
                            <li>• روی دکمه سبز کلیک کنید تا عکس بگیرید</li>
                        </ul>
                    </>
                ) : (
                    <ul className="text-error-800 space-y-1 text-sm">
                        <li>• عکس خود را بررسی کنید</li>
                        <li>• اگر عکس مناسب است، روی «تایید» کلیک کنید</li>
                        <li>• برای گرفتن عکس جدید، روی «عکس جدید» کلیک کنید</li>
                    </ul>
                )}
            </Box>

            <Box className="flex w-full items-center gap-2">
                {/* <Button
                    onClick={() => setUserData({ step: 1 })}
                    variant="destructive"
                    className="gapo-3 flex w-full items-center justify-center px-5 py-3 text-white"
                >
                    <XMarkIcon className="h-5 w-5 text-white" />
                    انصراف
                </Button> */}
                <LoadingButton
                    onClick={handleConfirm}
                    loading={isUploading}
                    disabled={!capturedPhoto || isUploading}
                    className="bg-primary flex w-full items-center justify-center gap-3 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {!isUploading && <CheckIcon className="h-5 w-5" />}
                    <Typography variant="body1" className="text-xs font-medium text-white">
                        {isUploading ? 'در حال ارسال...' : 'تایید'}
                    </Typography>
                </LoadingButton>
            </Box>
        </Box>
    );
}
