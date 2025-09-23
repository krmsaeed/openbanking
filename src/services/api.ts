import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

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
      headers: { 'Content-Type': 'application/json' },
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

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const resp = await this.client.get<T>(url, config);
    return this.wrapResponse<T>(resp);
  }

  async post<T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const resp = await this.client.post<T>(url, body, config);
    return this.wrapResponse<T>(resp);
  }

  async postFormData<T = unknown>(url: string, form: FormData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const resp = await this.client.post<T>(url, form, { headers: { 'Content-Type': 'multipart/form-data' }, ...config });
    return this.wrapResponse<T>(resp);
  }

  async put<T = unknown>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const resp = await this.client.put<T>(url, body, config);
    return this.wrapResponse<T>(resp);
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
