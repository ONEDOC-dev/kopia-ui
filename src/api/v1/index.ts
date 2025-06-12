import axios from "axios"
import {create} from 'zustand';

interface TokenState {
  token: string;
  setToken: (token: string) => void;
}

export const useTokenStore = create<TokenState>((set) => ({
  token: '-',
  setToken: (token) => set({ token }),
}));

const instance = axios.create({
  baseURL: '/api/v1'
});

instance.interceptors.request.use(
  (config) => {
    config.headers["X-Kopia-Csrf-Token"] = useTokenStore.getState().token;
    return config;
  },
  (error) => {
    console.error(error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error(error);
    return Promise.reject(error);
  }
);

export default instance;