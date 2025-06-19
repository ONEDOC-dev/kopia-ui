import { AxiosInstance, AxiosRequestConfig } from 'axios';
import axiosInstance from '@/api/v1/index';

const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

async function ipcWrappedRequest<T = any>(config: AxiosRequestConfig): Promise<T> {
  const response = await window.electron.apiRequest(config);
  
  if (response.success) {
    return response.data;
  } else {
    // 에러인 경우 axios 에러 형태로 변환하여 throw
    throw response.error;
  }
}

const instance: AxiosInstance & {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
} = axiosInstance as any;

if (!isLocalhost) {
  instance.request = <T = any>(config: AxiosRequestConfig) => ipcWrappedRequest<T>(config);

  instance.get = <T = any>(url: string, config?: AxiosRequestConfig) =>
    ipcWrappedRequest<T>({ ...config, method: 'get', url });

  instance.post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    ipcWrappedRequest<T>({ ...config, method: 'post', url, data });

  instance.put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    ipcWrappedRequest<T>({ ...config, method: 'put', url, data });

  instance.delete = <T = any>(url: string, config?: AxiosRequestConfig) =>
    ipcWrappedRequest<T>({ ...config, method: 'delete', url });
}

export default instance;