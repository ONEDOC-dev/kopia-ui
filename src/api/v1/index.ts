import axios, { AxiosInstance } from 'axios';
import { create } from 'zustand';

interface TokenState {
  token: string;
  setToken: (token: string) => void;
}

export const useTokenStore = create<TokenState>((set) => ({
  token: '-',
  setToken: (token) => set({ token }),
}));

const axiosInstance: AxiosInstance = axios.create({
  baseURL: '/api/v1',
});

axiosInstance.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers['X-Kopia-Csrf-Token'] = useTokenStore.getState().token;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export default axiosInstance;