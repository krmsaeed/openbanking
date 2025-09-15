import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const signature = formData.get('signature') as File;
        const video = formData.get('video') as File;
        const type = formData.get('type') as string;
        const timestamp = formData.get('timestamp') as string;
        const userInfo = formData.get('userInfo') as string;

        if (!signature || !video || !type) {
            return NextResponse.json(
                { error: 'اطلاعات ناقص ارسال شده است' },
                { status: 400 }
            );
        }

        const referenceId = `VER_${window !== undefined && Date.now()}_${Math.random().toString(36).substring(2, 8)}`.toUpperCase();

        const uploadDir = path.join(process.cwd(), 'uploads', referenceId);

        try {
            const signatureBuffer = Buffer.from(await signature.arrayBuffer());
            const videoBuffer = Buffer.from(await video.arrayBuffer());

            const signaturePath = path.join(uploadDir, 'signature.png');
            await writeFile(signaturePath, signatureBuffer);

            const videoPath = path.join(uploadDir, 'selfie-video.webm');
            await writeFile(videoPath, videoBuffer);

            const metadata = {
                referenceId,
                type,
                timestamp: parseInt(timestamp),
                userInfo: userInfo ? JSON.parse(userInfo) : null,
                files: {
                    signature: signaturePath,
                    video: videoPath
                },
                sizes: {
                    signature: signatureBuffer.length,
                    video: videoBuffer.length
                },
                submittedAt: new Date().toISOString()
            };

            const metadataPath = path.join(uploadDir, 'metadata.json');
            await writeFile(metadataPath, JSON.stringify(metadata, null, 2));

            console.log(`Verification data saved with reference ID: ${referenceId}`);

            await sendToExternalService(metadata);

            return NextResponse.json({
                success: true,
                message: 'اطلاعات با موفقیت دریافت و پردازش شد',
                referenceId: referenceId
            });

        } catch (fileError) {
            console.error('خطا در ذخیره فایل‌ها:', fileError);
            return NextResponse.json(
                { error: 'خطا در ذخیره اطلاعات' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('خطا در پردازش درخواست:', error);
        return NextResponse.json(
            { error: 'خطای داخلی سرور' },
            { status: 500 }
        );
    }
}

interface VerificationMetadata {
    referenceId: string;
    type: string;
    sizes: {
        signature: number;
        video: number;
    };
}

async function sendToExternalService(metadata: VerificationMetadata) {
    try {

        console.log('Data would be sent to external service:', {
            referenceId: metadata.referenceId,
            type: metadata.type,
            signatureSize: metadata.sizes.signature,
            videoSize: metadata.sizes.video
        });

        return { success: true };

    } catch (error) {
        console.error('خطا در ارسال به سرویس خارجی:', error);
        throw error;
    }
}
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const referenceId = searchParams.get('referenceId');

    if (!referenceId) {
        return NextResponse.json(
            { error: 'Reference ID الزامی است' },
            { status: 400 }
        );
    }
    try {
        const status = {
            referenceId,
            status: 'processing',
            submittedAt: new Date().toISOString(),
            lastUpdate: new Date().toISOString()
        };

        return NextResponse.json(status);

    } catch (error) {
        console.error('خطا در بازیابی وضعیت:', error);
        return NextResponse.json(
            { error: 'خطا در بازیابی اطلاعات' },
            { status: 500 }
        );
    }
}
