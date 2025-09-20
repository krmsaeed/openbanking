import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  [k: string]: any;
}

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE || '',
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private wrapResponse<T = any>(resp: { status: number; data: any }): ApiResponse<T> {
    const payload = resp.data;
    const hasSuccess = payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'success');
    const inferredSuccess = resp.status >= 200 && resp.status < 300;

    if (hasSuccess) {
      // backend already provided { success, ... }
      return payload as ApiResponse<T>;
    }

    if (payload && (typeof payload === 'object' || Array.isArray(payload))) {
      // pass through object/array members but ensure success exists
      return { success: inferredSuccess, ...(payload as object) } as ApiResponse<T>;
    }

    // primitive payload: place under `data`
    return { success: inferredSuccess, data: payload } as ApiResponse<T>;
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const resp = await this.client.get<T>(url, config);
    return this.wrapResponse<T>(resp as any);
  }

  async post<T = any>(url: string, body?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const resp = await this.client.post<T>(url, body, config);
    return this.wrapResponse<T>(resp as any);
  }

  async postFormData<T = any>(url: string, form: FormData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const resp = await this.client.post<T>(url, form, { headers: { 'Content-Type': 'multipart/form-data' }, ...config });
    return this.wrapResponse<T>(resp as any);
  }

  async put<T = any>(url: string, body?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const resp = await this.client.put<T>(url, body, config);
    return this.wrapResponse<T>(resp as any);
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
