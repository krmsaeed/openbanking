import { apiClient, ApiResponse } from './api';

export interface AuthCredentials {
    phoneNumber: string;
    otp?: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        phoneNumber: string;
        isVerified: boolean;
    };
}

export interface OtpResponse {
    referenceId: string;
    expiresAt: string;
}

class AuthService {
    async sendOtp(phoneNumber: string): Promise<ApiResponse<OtpResponse>> {
        return apiClient.post<OtpResponse>('/auth/send-otp', { phoneNumber });
    }

    async verifyOtp(phoneNumber: string, otp: string): Promise<ApiResponse<AuthResponse>> {
        return apiClient.post<AuthResponse>('/auth/verify-otp', { phoneNumber, otp });
    }

    async refreshToken(): Promise<ApiResponse<AuthResponse>> {
        return apiClient.post<AuthResponse>('/auth/refresh');
    }

    async logout(): Promise<ApiResponse<void>> {
        const response = await apiClient.post<void>('/auth/logout');
        apiClient.removeAuthToken();
        return response;
    }

    setAuthToken(token: string) {
        apiClient.setAuthToken(token);
        if (typeof window !== 'undefined') {
            localStorage.setItem('authToken', token);
        }
    }

    getAuthToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('authToken');
        }
        return null;
    }

    removeAuthToken() {
        apiClient.removeAuthToken();
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
        }
    }

    isAuthenticated(): boolean {
        return !!this.getAuthToken();
    }
}

export const authService = new AuthService();
