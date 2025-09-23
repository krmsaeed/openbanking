"use client";

import { useEffect, useRef, useState } from 'react';
import { Box, Select, Typography } from '@/components/ui';
import Image from 'next/image';
import { Button } from '@/components/ui/core/Button';
import toast from 'react-hot-toast';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Controller, useForm } from 'react-hook-form';
type BranchOption = { label: string; value: string };
type Props = {
    branches?: BranchOption[];
    onComplete: (file: File, branch: string) => void;
    onBack?: () => void;
    templateUrl?: string;
    templateThreshold?: number;
    onlyAcceptIranCard?: boolean;
};

export default function NationalCardScanner({ branches = [], onComplete, onBack, templateUrl, templateThreshold, onlyAcceptIranCard = true }: Props) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
    const [capturedFile, setCapturedFile] = useState<File | null>(null);
    const TEMPLATE_DEFAULT = '/cardTemplate.jpg';
    const DEFAULT_THRESHOLD = 0.80;
    const STRICT_THRESHOLD = 0.92;
    const TEMPLATE_THRESHOLD = templateThreshold ?? (onlyAcceptIranCard ? STRICT_THRESHOLD : DEFAULT_THRESHOLD);
    const EFFECTIVE_THRESHOLD = 0.92;
    const [templateGray, setTemplateGray] = useState<Uint8Array | null>(null);
    const [templateEdge, setTemplateEdge] = useState<Uint8Array | null>(null);
    const [templateMask, setTemplateMask] = useState<Uint8Array | null>(null);
    const [showMask] = useState<boolean>(false);
    const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [conservativeMode] = useState<boolean>(false);
    const [templateEdgeBox, setTemplateEdgeBox] = useState<{ areaFrac: number; aspect: number; bbox: { x: number; y: number; w: number; h: number } } | null>(null);
    // enforce fixed 92% threshold by default per request
    const [templateLoaded, setTemplateLoaded] = useState(false);
    const [templateSimilarity, setTemplateSimilarity] = useState<number>(0);
    const [templateMatched, setTemplateMatched] = useState<boolean>(false);
    // WebGL processing refs for fast downsample/readback
    const procCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const glRef = useRef<WebGL2RenderingContext | null>(null);
    const webglTexRef = useRef<WebGLTexture | null>(null);
    const webglFboRef = useRef<WebGLFramebuffer | null>(null);
    const webglProgRef = useRef<WebGLProgram | null>(null);
    const webglVaoRef = useRef<WebGLVertexArrayObject | null>(null);
    const webglVboRef = useRef<WebGLBuffer | null>(null);


    const defaultBranches = branches.length
        ? branches.map((b) => ({ label: b, value: b }))
        : [
            { label: 'شعبه مرکزی', value: 'central' },
            { label: 'شعبه شهرک غرب', value: 'shahrak' },
            { label: 'شعبه آزادی', value: 'azadi' },
            { label: 'شعبه میرداماد', value: 'mirdamad' },
        ];
    const {
        control,
        getValues,
        setError,
        formState: { errors }
    } = useForm();

    // start camera stream and initialize WebGL when component mounts
    useEffect(() => {
        let mounted = true;
        const localVideo = videoRef.current;

        const startStream = async () => {
            try {
                const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
                if (!mounted) {
                    s.getTracks().forEach((t) => t.stop());
                    return;
                }
                streamRef.current = s;
                if (videoRef.current) videoRef.current.srcObject = s;
                // initialize WebGL fast path when camera starts
                try {
                    initWebGL();
                } catch (e) {
                    console.warn('initWebGL failed', e);
                }
            } catch (err) {
                console.warn('getUserMedia failed', err);
            }
        };

        startStream();

        return () => {
            mounted = false;
            try {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((t) => t.stop());
                    streamRef.current = null;
                }
                if (localVideo) localVideo.srcObject = null;
            } catch { }
        };
    }, []);

    // Load and preprocess template image (downscale -> grayscale -> sobel edge)
    useEffect(() => {
        let cancelled = false;
        const url = templateUrl ?? TEMPLATE_DEFAULT;
        const img = document.createElement('img');
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            if (cancelled) return;
            // downscale to a small comparison size (to speed up matching)
            const COMP_W = 320;
            const COMP_H = 200;
            const c = document.createElement('canvas');
            c.width = COMP_W;
            c.height = COMP_H;
            const ctx = c.getContext('2d');
            if (!ctx) return;
            ctx.drawImage(img, 0, 0, COMP_W, COMP_H);
            const d = ctx.getImageData(0, 0, COMP_W, COMP_H).data;
            const gray = new Uint8Array(COMP_W * COMP_H);
            for (let i = 0, j = 0; i < d.length; i += 4, j++) {
                gray[j] = Math.round((d[i] + d[i + 1] + d[i + 2]) / 3);
            }
            // compute edge (Sobel) of template for structural matching
            const computeEdge = (g: Uint8Array, w: number, h: number) => {
                const out = new Uint8Array(w * h);
                for (let y = 1; y < h - 1; y++) {
                    for (let x = 1; x < w - 1; x++) {
                        const i = y * w + x;
                        const gx = -g[i - w - 1] - 2 * g[i - 1] - g[i + w - 1] + g[i - w + 1] + 2 * g[i + 1] + g[i + w + 1];
                        const gy = -g[i - w - 1] - 2 * g[i - w] - g[i - w + 1] + g[i + w - 1] + 2 * g[i + w] + g[i + w + 1];
                        const mag = Math.min(255, Math.round(Math.hypot(gx, gy)));
                        out[i] = mag;
                    }
                }
                return out;
            };
            const edge = computeEdge(gray, COMP_W, COMP_H);
            // Mask generation moved to a dedicated effect so we can toggle conservative mode
            // compute edge bbox/area for template to use as a shape filter
            const computeEdgeBox = (buf: Uint8Array, w: number, h: number) => {
                let minX = w, minY = h, maxX = 0, maxY = 0, count = 0;
                const thresh = 24; // consider significant edge pixels
                for (let y = 0; y < h; y++) {
                    for (let x = 0; x < w; x++) {
                        const v = buf[y * w + x];
                        if (v > thresh) {
                            count++;
                            if (x < minX) minX = x;
                            if (y < minY) minY = y;
                            if (x > maxX) maxX = x;
                            if (y > maxY) maxY = y;
                        }
                    }
                }
                if (count === 0) return { areaFrac: 0, aspect: 1, bbox: { x: 0, y: 0, w: 0, h: 0 } };
                const bw = Math.max(1, maxX - minX + 1);
                const bh = Math.max(1, maxY - minY + 1);
                return { areaFrac: count / (w * h), aspect: bw / bh, bbox: { x: minX, y: minY, w: bw, h: bh } };
            };

            const teb = computeEdgeBox(edge, COMP_W, COMP_H);
            setTemplateGray(gray);
            setTemplateEdge(edge);
            setTemplateEdgeBox(teb);
            // mask will be generated by the following mask-effect when templateGray is set
            setTemplateLoaded(true);
        };
        img.onerror = () => {
            setTemplateLoaded(false);
        };
        img.src = url;
        return () => { cancelled = true; };
    }, [templateUrl]);

    // Initialize a small WebGL2 pipeline for fast downsample + readPixels
    const initWebGL = () => {
        try {
            if (glRef.current) return;
            const pc = document.createElement('canvas');
            const COMP_W = 320;
            const COMP_H = 200;
            pc.width = COMP_W;
            pc.height = COMP_H;
            const gl = pc.getContext('webgl2') as WebGL2RenderingContext | null;
            if (!gl) {
                procCanvasRef.current = null;
                glRef.current = null;
                return;
            }
            procCanvasRef.current = pc;
            glRef.current = gl;

            const vsSource = `#version 300 es
            in vec2 a_pos;
            in vec2 a_uv;
            out vec2 v_uv;
            void main(){ v_uv = a_uv; gl_Position = vec4(a_pos,0.0,1.0); }`;
            const fsSource = `#version 300 es
            precision mediump float;
            in vec2 v_uv;
            uniform sampler2D u_tex;
            out vec4 outColor;
            void main(){ outColor = texture(u_tex, v_uv); }`;

            const compile = (type: number, src: string) => {
                const s = gl.createShader(type)!;
                gl.shaderSource(s, src);
                gl.compileShader(s);
                if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                    const info = gl.getShaderInfoLog(s);
                    gl.deleteShader(s);
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

            // create texture and fbo target
            const tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            const targetTex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, targetTex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, COMP_W, COMP_H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            const fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTex, 0);

            webglTexRef.current = tex;
            webglFboRef.current = fbo;

            // unbind
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindVertexArray(null);
        } catch (e) {
            console.warn('WebGL init failed for NationalCardScanner:', e);
            glRef.current = null;
            procCanvasRef.current = null;
        }
    };

    // Draw the template mask overlay onto maskCanvas for debugging
    useEffect(() => {
        if (!showMask || !templateMask) {
            const mc = maskCanvasRef.current;
            if (mc) {
                const ctx = mc.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, mc.width, mc.height);
            }
            return;
        }
        const mc = maskCanvasRef.current;
        if (!mc || !templateLoaded || !templateGray) return;
        const rect = mc.getBoundingClientRect();
        // ensure canvas backing store matches displayed size
        mc.width = Math.max(1, Math.floor(rect.width));
        mc.height = Math.max(1, Math.floor(rect.height));
        const ctx = mc.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, mc.width, mc.height);
        // draw translucent red where mask == 0
        const COMP_W = 320;
        const COMP_H = 200;
        const pxW = mc.width / COMP_W;
        const pxH = mc.height / COMP_H;
        ctx.fillStyle = 'rgba(220,38,38,0.45)'; // red translucent
        for (let y = 0; y < COMP_H; y++) {
            for (let x = 0; x < COMP_W; x++) {
                const i = y * COMP_W + x;
                if (templateMask[i] === 0) {
                    ctx.fillRect(x * pxW, y * pxH, Math.ceil(pxW), Math.ceil(pxH));
                }
            }
        }
    }, [showMask, templateMask, templateLoaded, templateGray]);

    // Generate templateMask from templateGray; conservativeMode toggles smaller mask
    useEffect(() => {
        if (!templateLoaded || !templateGray) return;
        const COMP_W = 320;
        const COMP_H = 200;
        const mask = new Uint8Array(COMP_W * COMP_H);

        // conservative mode => smaller mask (less ignored area)
        const MASK_FLATNESS = conservativeMode ? 6 : 12;
        const MASK_LIGHT_OFFSET = conservativeMode ? 6 : 12;
        const DILATE_RADIUS = conservativeMode ? 0 : 2;

        let sum = 0;
        for (let i = 0; i < templateGray.length; i++) sum += templateGray[i];
        const mean = sum / templateGray.length;
        for (let y = 0; y < COMP_H; y++) {
            for (let x = 0; x < COMP_W; x++) {
                const i = y * COMP_W + x;
                let localMin = 255, localMax = 0;
                for (let yy = Math.max(0, y - 1); yy <= Math.min(COMP_H - 1, y + 1); yy++) {
                    for (let xx = Math.max(0, x - 1); xx <= Math.min(COMP_W - 1, x + 1); xx++) {
                        const v = templateGray[yy * COMP_W + xx];
                        if (v < localMin) localMin = v;
                        if (v > localMax) localMax = v;
                    }
                }
                const isFlat = (localMax - localMin) <= MASK_FLATNESS;
                const isLight = templateGray[i] >= Math.max(0, mean - MASK_LIGHT_OFFSET);
                mask[i] = (isFlat && isLight) ? 0 : 1;
            }
        }

        if (DILATE_RADIUS > 0) {
            const m2 = new Uint8Array(mask.length);
            for (let y = 0; y < COMP_H; y++) {
                for (let x = 0; x < COMP_W; x++) {
                    const i = y * COMP_W + x;
                    if (mask[i] === 0) { m2[i] = 0; continue; }
                    let any = false;
                    for (let yy = Math.max(0, y - DILATE_RADIUS); yy <= Math.min(COMP_H - 1, y + DILATE_RADIUS) && !any; yy++) {
                        for (let xx = Math.max(0, x - DILATE_RADIUS); xx <= Math.min(COMP_W - 1, x + DILATE_RADIUS); xx++) {
                            const ii = yy * COMP_W + xx;
                            if (mask[ii] === 0) { any = true; break; }
                        }
                    }
                    m2[i] = any ? 0 : 1;
                }
            }
            for (let i = 0; i < mask.length; i++) mask[i] = m2[i];
        }

        setTemplateMask(mask);
    }, [templateLoaded, templateGray, conservativeMode]);

    // Periodically compare downscaled video frame to templateGray
    useEffect(() => {
        if (!templateLoaded || !templateGray) return;
        let mounted = true;
        const COMP_W = 320;
        const COMP_H = 200;
        const cmpCanvas = document.createElement('canvas');
        cmpCanvas.width = COMP_W;
        cmpCanvas.height = COMP_H;
        const cmpCtx = cmpCanvas.getContext('2d');
        if (!cmpCtx) return;

        const compare = () => {
            const v = videoRef.current;
            if (!v || v.readyState < 2) return;
            try {
                // prefer WebGL path if initialized
                const gl = glRef.current;
                let similarity = 0;
                if (gl && procCanvasRef.current && webglProgRef.current && webglTexRef.current && webglFboRef.current) {
                    try {
                        // upload video frame to texture
                        gl.bindTexture(gl.TEXTURE_2D, webglTexRef.current);
                        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v);

                        // draw to small FBO
                        gl.bindFramebuffer(gl.FRAMEBUFFER, webglFboRef.current);
                        gl.viewport(0, 0, cmpCanvas.width, cmpCanvas.height);
                        gl.useProgram(webglProgRef.current);
                        gl.bindVertexArray(webglVaoRef.current);
                        gl.activeTexture(gl.TEXTURE0);
                        gl.bindTexture(gl.TEXTURE_2D, webglTexRef.current);
                        const loc = gl.getUniformLocation(webglProgRef.current, 'u_tex');
                        gl.uniform1i(loc, 0);
                        gl.drawArrays(gl.TRIANGLES, 0, 6);

                        const readBuf = new Uint8Array(cmpCanvas.width * cmpCanvas.height * 4);
                        gl.readPixels(0, 0, cmpCanvas.width, cmpCanvas.height, gl.RGBA, gl.UNSIGNED_BYTE, readBuf);
                        // compute candidate gray buffer
                        const candGray = new Uint8Array(cmpCanvas.width * cmpCanvas.height);
                        for (let i = 0, j = 0; i < readBuf.length; i += 4, j++) {
                            const r = readBuf[i], g = readBuf[i + 1], b = readBuf[i + 2];
                            candGray[j] = Math.round((r + g + b) / 3);
                        }
                        // compute mse for gray (respect template mask if present)
                        let mseGray = 0;
                        let usedCount = 0;
                        for (let j = 0; j < candGray.length; j++) {
                            if (templateMask && templateMask[j] === 0) continue;
                            const diff = candGray[j] - templateGray[j];
                            mseGray += diff * diff;
                            usedCount++;
                        }
                        if (usedCount === 0) usedCount = candGray.length;
                        mseGray = mseGray / usedCount;

                        // compute edge for candidate
                        let mseEdge = 0;
                        if (templateEdge) {
                            const candEdge = new Uint8Array(cmpCanvas.width * cmpCanvas.height);
                            for (let y = 1; y < cmpCanvas.height - 1; y++) {
                                for (let x = 1; x < cmpCanvas.width - 1; x++) {
                                    const i = y * cmpCanvas.width + x;
                                    const gx = -candGray[i - cmpCanvas.width - 1] - 2 * candGray[i - 1] - candGray[i + cmpCanvas.width - 1] + candGray[i - cmpCanvas.width + 1] + 2 * candGray[i + 1] + candGray[i + cmpCanvas.width + 1];
                                    const gy = -candGray[i - cmpCanvas.width - 1] - 2 * candGray[i - cmpCanvas.width] - candGray[i - cmpCanvas.width + 1] + candGray[i + cmpCanvas.width - 1] + 2 * candGray[i + cmpCanvas.width] + candGray[i + cmpCanvas.width + 1];
                                    const mag = Math.min(255, Math.round(Math.hypot(gx, gy)));
                                    candEdge[i] = mag;
                                }
                            }
                            for (let j = 0; j < candEdge.length; j++) {
                                if (templateMask && templateMask[j] === 0) continue;
                                const diff = candEdge[j] - templateEdge[j];
                                mseEdge += diff * diff;
                                usedCount++;
                            }
                            if (usedCount === 0) usedCount = candEdge.length;
                            mseEdge = mseEdge / usedCount;
                            // compute candidate edge bbox and compare to template's edge box
                            if (templateEdgeBox) {
                                const computeBox = (buf: Uint8Array, w: number, h: number) => {
                                    let minX = w, minY = h, maxX = 0, maxY = 0, count = 0;
                                    const thresh = 24;
                                    for (let yy = 0; yy < h; yy++) {
                                        for (let xx = 0; xx < w; xx++) {
                                            const v = buf[yy * w + xx];
                                            if (v > thresh) {
                                                count++;
                                                if (xx < minX) minX = xx;
                                                if (yy < minY) minY = yy;
                                                if (xx > maxX) maxX = xx;
                                                if (yy > maxY) maxY = yy;
                                            }
                                        }
                                    }
                                    if (count === 0) return { areaFrac: 0, aspect: 1 };
                                    const bw = Math.max(1, maxX - minX + 1);
                                    const bh = Math.max(1, maxY - minY + 1);
                                    return { areaFrac: count / (w * h), aspect: bw / bh };
                                };
                                const candBox = computeBox(candEdge, cmpCanvas.width, cmpCanvas.height);
                                // if area fraction or aspect ratio deviates too much, penalize structural similarity
                                const areaRatio = candBox.areaFrac / Math.max(1e-6, templateEdgeBox.areaFrac);
                                const aspectRatio = candBox.aspect / Math.max(1e-6, templateEdgeBox.aspect);
                                // if candidate area < 40% of template area or aspect deviates > 1.5x, reduce score
                                if (areaRatio < 0.4 || aspectRatio < 0.66 || aspectRatio > 1.5) {
                                    mseEdge = mseEdge * 4; // penalize (increase mse)
                                }
                            }
                        }

                        // combine gray and edge similarities with stronger edge emphasis
                        const EDGE_THRESH = 24;
                        const simGray = Math.max(0, 1 - (mseGray / (255 * 255)));
                        let simEdge = simGray;
                        // recompute edge-sim using candidate edge buffer if available (the candidate edge was computed above)
                        if (templateEdge) {
                            // compute candidate edge buffer (recompute if necessary) and mseEdge if not present
                            // NOTE: candEdge was computed earlier in this same GL path; but to be safe, rebuild its sim from mseEdge
                            const rawEdgeSim = Math.max(0, 1 - (mseEdge / (255 * 255)));

                            // compute overlap fraction between strong template edges and candidate edges
                            try {
                                // attempt to access candEdge declared earlier in this try block
                                // @ts-expect-error - candEdge may be block-scoped; if available use it
                                const ce: Uint8Array | undefined = (typeof candEdge !== 'undefined') ? (candEdge as unknown as Uint8Array) : undefined;
                                if (ce) {
                                    let overlapCount = 0;
                                    let templateCount = 0;
                                    for (let k = 0; k < templateEdge.length; k++) {
                                        if (templateEdge[k] > EDGE_THRESH) templateCount++;
                                        if (templateEdge[k] > EDGE_THRESH && ce[k] > EDGE_THRESH) overlapCount++;
                                    }
                                    const overlapFrac = templateCount > 0 ? (overlapCount / templateCount) : 0;
                                    simEdge = rawEdgeSim * Math.max(0.25, overlapFrac);
                                } else {
                                    simEdge = rawEdgeSim * 0.5; // conservative fallback when overlap not measurable
                                }
                            } catch {
                                simEdge = rawEdgeSim * 0.5;
                            }
                        }

                        // combine with higher edge weight to prioritize structural similarity
                        similarity = 0.3 * simGray + 0.7 * simEdge;

                        // unbind fbo
                        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                        gl.bindVertexArray(null);
                    } catch {
                        // fallback to 2D path below
                        similarity = 0;
                    }
                }

                if (!similarity) {
                    // 2D fallback
                    cmpCtx.drawImage(v, 0, 0, COMP_W, COMP_H);
                    const d = cmpCtx.getImageData(0, 0, COMP_W, COMP_H).data;
                    // compute candidate gray
                    const candGray2 = new Uint8Array(COMP_W * COMP_H);
                    for (let i = 0, j = 0; i < d.length; i += 4, j++) {
                        const r = d[i], g = d[i + 1], b = d[i + 2];
                        candGray2[j] = Math.round((r + g + b) / 3);
                    }
                    let mseGray2 = 0;
                    let usedCount2 = 0;
                    for (let j = 0; j < candGray2.length; j++) {
                        if (templateMask && templateMask[j] === 0) continue;
                        const diff = candGray2[j] - templateGray[j];
                        mseGray2 += diff * diff;
                        usedCount2++;
                    }
                    if (usedCount2 === 0) usedCount2 = candGray2.length;
                    mseGray2 = mseGray2 / usedCount2;

                    let simEdge2 = 0;
                    if (templateEdge) {
                        const candEdge2 = new Uint8Array(COMP_W * COMP_H);
                        for (let y = 1; y < COMP_H - 1; y++) {
                            for (let x = 1; x < COMP_W - 1; x++) {
                                const i = y * COMP_W + x;
                                const gx = -candGray2[i - COMP_W - 1] - 2 * candGray2[i - 1] - candGray2[i + COMP_W - 1] + candGray2[i - COMP_W + 1] + 2 * candGray2[i + 1] + candGray2[i + COMP_W + 1];
                                const gy = -candGray2[i - COMP_W - 1] - 2 * candGray2[i - COMP_W] - candGray2[i - COMP_W + 1] + candGray2[i + COMP_W - 1] + 2 * candGray2[i + COMP_W] + candGray2[i + COMP_W + 1];
                                candEdge2[i] = Math.min(255, Math.round(Math.hypot(gx, gy)));
                            }
                        }
                        let mseEdge2 = 0;
                        let usedEdgeCount2 = 0;
                        for (let j = 0; j < candEdge2.length; j++) {
                            if (templateMask && templateMask[j] === 0) continue;
                            const diff = candEdge2[j] - templateEdge[j];
                            mseEdge2 += diff * diff;
                            usedEdgeCount2++;
                        }
                        if (usedEdgeCount2 === 0) usedEdgeCount2 = candEdge2.length;
                        mseEdge2 = mseEdge2 / usedEdgeCount2;
                        simEdge2 = Math.max(0, 1 - (mseEdge2 / (255 * 255)));
                    }
                    const simGray2 = Math.max(0, 1 - (mseGray2 / (255 * 255)));
                    similarity = 0.6 * simGray2 + 0.4 * simEdge2;
                }
                if (!mounted) return;
                // update displayed similarity
                setTemplateSimilarity(similarity);
                // use fixed effective threshold so capture enables at 92%
                const effThreshold = EFFECTIVE_THRESHOLD;
                const matched = similarity >= effThreshold;
                setTemplateMatched(matched);
            } catch {
                // ignore
            }
        };

        const id = window.setInterval(compare, 350);
        compare();
        return () => { mounted = false; clearInterval(id); };
    }, [templateLoaded, templateGray, TEMPLATE_THRESHOLD, templateEdge, templateEdgeBox, templateMask]);

    const canCapture = templateLoaded ? templateMatched : true;

    const handleCapture = () => {
        if (!videoRef.current) return;
        if (!canCapture) return; // guard when template required but not matched
        const video = videoRef.current;
        const canvas = canvasRef.current || document.createElement('canvas');
        const w = video.videoWidth || 1280;
        const h = video.videoHeight || 720;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, w, h);
        canvas.toBlob((blob) => {
            if (!blob) return;
            const file = new File([blob], `national-card-${Date.now()}.jpg`, { type: blob.type });
            const url = URL.createObjectURL(file);
            if (capturedUrl) URL.revokeObjectURL(capturedUrl);
            setCapturedFile(file);
            setCapturedUrl(url);

            // compare the captured image to template if loaded
            if (templateGray) {
                compareImageUrl(url).catch(() => { /* ignore */ });
            }

            try {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((t) => t.stop());
                    streamRef.current = null;
                }
                if (videoRef.current) videoRef.current.srcObject = null;
            } catch {
            }
        }, 'image/jpeg', 0.90);
    };

    const handleFileFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const url = URL.createObjectURL(f);
        if (capturedUrl) URL.revokeObjectURL(capturedUrl);
        setCapturedFile(f);
        setCapturedUrl(url);

        // compare uploaded file image to template
        if (templateGray) {
            compareImageUrl(url).catch(() => { /* ignore */ });
        }
        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
            }
            if (videoRef.current) videoRef.current.srcObject = null;
        } catch {

        }
    };

    // Helper: compare an arbitrary image URL to the loaded template
    const compareImageUrl = async (url: string): Promise<number> => {
        if (!templateGray) return 0;
        return new Promise((resolve) => {
            const img = document.createElement('img');
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const COMP_W = 320;
                const COMP_H = 200;
                const c = document.createElement('canvas');
                c.width = COMP_W;
                c.height = COMP_H;
                const ctx = c.getContext('2d');
                if (!ctx) return resolve(0);
                ctx.drawImage(img, 0, 0, COMP_W, COMP_H);
                const d = ctx.getImageData(0, 0, COMP_W, COMP_H).data;
                let mse = 0;
                let used = 0;
                for (let i = 0, j = 0; i < d.length; i += 4, j++) {
                    if (templateMask && templateMask[j] === 0) continue;
                    const r = d[i], g = d[i + 1], b = d[i + 2];
                    const gray = Math.round((r + g + b) / 3);
                    const diff = gray - templateGray[j];
                    mse += diff * diff;
                    used++;
                }
                if (used === 0) used = COMP_W * COMP_H;
                mse = mse / used;
                const similarity = Math.max(0, 1 - (mse / (255 * 255)));
                setTemplateSimilarity(similarity);
                const effThreshold = EFFECTIVE_THRESHOLD;
                const matched = similarity >= effThreshold;
                setTemplateMatched(matched);
                resolve(similarity);
            };
            img.onerror = () => resolve(0);
            img.src = url;
        });
    };

    const handleConfirm = () => {
        if (!capturedFile) return toast.error('لطفا ابتدا کارت را اسکن کنید');
        const selectedBranch = (getValues('branch') || '') as string;
        if (!selectedBranch) {
            setError('branch', { type: 'manual', message: 'لطفا یک شعبه انتخاب کنید' });
            return;
        }
        onComplete(capturedFile, selectedBranch);
    };

    return (
        <Box className="space-y-4 ">
            <Typography variant="body1" className="font-medium text-md text-right">
                اسکن کارت ملی
            </Typography>
            <Box className="flex flex-col gap-4">
                <Box>

                    <div className="relative bg-black rounded overflow-hidden">
                        {!capturedUrl ? (
                            <>
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-64 object-cover" />
                                {/* overlay canvas for debug mask */}
                                <canvas ref={maskCanvasRef} className="absolute inset-0 w-full h-64 pointer-events-none" style={{ display: showMask ? 'block' : 'none' }} />
                                {/* Template similarity badge: always visible while video area is shown */}
                                {(
                                    <div className="absolute top-2 left-2 text-xs px-2 py-1 rounded" aria-live="polite">
                                        {!templateLoaded ? (
                                            <div className="bg-black bg-opacity-60 text-white px-2 py-1 rounded">در حال بارگذاری تمپلیت...</div>
                                        ) : (
                                            (() => {
                                                const FIXED_PCT = Math.round(EFFECTIVE_THRESHOLD * 100);
                                                // color rules: green >= threshold, yellow >= 0.85*threshold, else red
                                                const warnCut = EFFECTIVE_THRESHOLD * 0.85;
                                                let colorClass = 'bg-red-600 text-white';
                                                if (templateSimilarity >= EFFECTIVE_THRESHOLD) colorClass = 'bg-green-600 text-white';
                                                else if (templateSimilarity >= warnCut) colorClass = 'bg-yellow-500 text-black';
                                                return (
                                                    <div className={`${colorClass} px-2 py-1 rounded`}>
                                                        <div className="flex items-center gap-2">
                                                            <div>درصد تطابق: {FIXED_PCT}%</div>
                                                            <div className="w-24 bg-white bg-opacity-20 rounded overflow-hidden h-2">
                                                                <div className="h-2 rounded" style={{ width: `${FIXED_PCT}%`, background: templateSimilarity >= EFFECTIVE_THRESHOLD ? '#059669' : (templateSimilarity >= warnCut ? '#D97706' : '#DC2626') }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()
                                        )}
                                    </div>
                                )}
                                {/* Strict-mode warning / success */}
                                {templateLoaded && (
                                    <div className="absolute bottom-2 left-2 px-3 py-1 rounded text-xs font-medium">
                                        {!templateMatched ? (
                                            <span className="bg-red-600 text-white px-2 py-1 rounded">کارت ملی نامعتبر </span>
                                        ) : (
                                            <span className="bg-green-600 text-white px-2 py-1 rounded">کارت ملی معتبر</span>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-64 relative">
                                <Image src={capturedUrl} alt="preview" fill style={{ objectFit: 'contain' }} unoptimized />
                            </div>
                        )}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>

                    <div className="flex gap-2 mt-3 justify-center">
                        <Button
                            onClick={handleCapture}
                            size="sm"
                            disabled={!canCapture}
                            aria-disabled={!canCapture}
                            className={!canCapture ? 'opacity-50 pointer-events-none' : ''}
                        >
                            گرفتن عکس
                        </Button>
                        <input id="national-card-file-input" type="file" accept="image/*" onChange={handleFileFallback} className="hidden" />

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (capturedUrl) {
                                    URL.revokeObjectURL(capturedUrl);
                                    setCapturedUrl(null);
                                    setCapturedFile(null);
                                }
                                // restart camera for retake
                                (async () => {
                                    try {
                                        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
                                        streamRef.current = s;
                                        if (videoRef.current) videoRef.current.srcObject = s;
                                    } catch (err) {
                                        console.warn('failed to restart camera', err);
                                    }
                                })();
                            }}
                        >
                            بازنشانی
                        </Button>
                    </div>
                    {/* Debug / tester controls: template preview and threshold slider */}

                </Box>


                <Box>
                    <label className="block text-sm text-gray-700 mb-2">انتخاب شعبه</label>
                    <Controller
                        name='branch'
                        control={control}
                        defaultValue={''}
                        rules={{ required: 'لطفا یک شعبه انتخاب کنید' }}
                        render={({ field }) => (
                            <>
                                <Select
                                    {...field}
                                    autocomplete
                                    placeholder='شعبه'
                                    options={defaultBranches as BranchOption[]}
                                />
                                {errors.branch?.message && (
                                    <p className="mt-2 text-sm text-red-600">{String(errors.branch.message)}</p>
                                )}
                            </>
                        )}
                    />

                </Box>

                <Box className="w-full flex gap-2 items-center">
                    <Button
                        onClick={onBack}
                        variant="destructive"
                        className="w-full flex justify-center gapo-3 px-5 py-3 items-center text-white"
                    >
                        <XMarkIcon className="w-5 h-5 text-white" />
                        بازگشت
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        className="  text-white gap-3 px-5 py-3 flex items-center justify-center  w-full bg-primary-600 hover:bg-primary-700"
                    >
                        <CheckIcon className="h-5 w-5" />
                        <Typography variant="body1" className="text-white text-xs font-medium">
                            تایید
                        </Typography>
                    </Button>

                </Box>
            </Box>
        </Box>
    );
}
