"use client";
import { apiClient, ApiResponse } from './api';

export interface UserInfo {
    email?: string;
    phone?: string;
    name?: string;
    dateOfBirth?: string;
    address?: string;
}

export interface VerificationData {
    signature: string | File;
    video: File;
    selfie?: File;
    national_card?: File;
    type: 'login' | 'register';
    userInfo?: UserInfo;
}

export interface VerificationResponse {
    referenceId: string;
    status: 'pending' | 'processing' | 'approved' | 'rejected';
    message: string;
}

export interface VerificationStatus {
    referenceId: string;
    status: 'pending' | 'processing' | 'approved' | 'rejected';
    message: string;
    createdAt: string;
    updatedAt: string;
}

class VerificationService {
    async submitVerification(data: VerificationData): Promise<ApiResponse<VerificationResponse>> {
        const formData = new FormData();
        // Ensure we generate a numeric timestamp. This service is a client service, so
        // `Date.now()` is safe to call here. Avoid incorrect `window !== 'undefined'` checks.
        const timestamp = Date.now();
        if (typeof data.signature === 'string') {
            formData.append('signature', data.signature);
        } else {
            formData.append('signature', data.signature);
        }

        formData.append('video', data.video);
        if (data.selfie) {
            formData.append('selfie', data.selfie);
        }
        if (data.national_card) {
            formData.append('national_card', data.national_card);
        }
        formData.append('type', data.type);
        formData.append('timestamp', timestamp.toString());

        if (data.userInfo) {
            formData.append('userInfo', JSON.stringify(data.userInfo));
        }

        return apiClient.postFormData<VerificationResponse>('/verification', formData);
    }

    async getVerificationStatus(referenceId: string): Promise<ApiResponse<VerificationStatus>> {
        return apiClient.get<VerificationStatus>(`/verification?referenceId=${referenceId}`);
    }

    async updateVerificationStatus(
        referenceId: string,
        status: VerificationStatus['status']
    ): Promise<ApiResponse<VerificationStatus>> {
        return apiClient.put<VerificationStatus>(`/verification/${referenceId}`, { status });
    }
}

export const verificationService = new VerificationService();
