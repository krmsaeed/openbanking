import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const REQUEST_TIMEOUT_MS = 10000;

const axiosConfig: AxiosRequestConfig = {
  headers: { 'Content-Type': 'application/json' },
};

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  [k: string]: unknown;
}

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE || '',
      ...axiosConfig,
    });
  }

  private wrapResponse<T = unknown>(resp: AxiosResponse<T>): ApiResponse<T> {
    const payload = resp.data as unknown;
    const hasSuccess = payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'success');
    const inferredSuccess = resp.status >= 200 && resp.status < 300;

    if (hasSuccess) {

      return payload as ApiResponse<T>;
    }

    if (payload && (typeof payload === 'object' || Array.isArray(payload))) {

      return { success: inferredSuccess, ...(payload as object) } as ApiResponse<T>;
    }


    return { success: inferredSuccess, data: payload as T } as ApiResponse<T>;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await this.client.get(url, { ...config, signal: controller.signal });
      clearTimeout(timeoutId);
      return this.wrapResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async post<T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await this.client.post<T>(url, body, { ...config, signal: controller.signal });
      clearTimeout(timeoutId);
      return this.wrapResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async postFormData<T = unknown>(url: string, form: FormData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await this.client.post<T>(url, form, { headers: { 'Content-Type': 'multipart/form-data' }, ...config, signal: controller.signal });
      clearTimeout(timeoutId);
      return this.wrapResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async put<T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await this.client.put<T>(url, body, { ...config, signal: controller.signal });
      clearTimeout(timeoutId);
      return this.wrapResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  setAuthToken(token: string) {
    this.client.defaults.headers.Authorization = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.client.defaults.headers.Authorization;
  }
}

export const apiClient = new APIClient();

export default apiClient;
