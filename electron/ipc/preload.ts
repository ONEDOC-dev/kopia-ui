import {ipcRenderer, contextBridge} from 'electron';

import {PreloadElectronAPI, TokenResponse} from "./types"
import {AxiosRequestConfig} from "axios";

const electronAPI: PreloadElectronAPI = {
  refreshToken: () => ipcRenderer.invoke('refresh-token'),
  authStart: () => ipcRenderer.invoke('auth-start'),
  onAuthError: (callback) => {
    const wrappedCallback = (_: any, error: string) => callback(error);
    ipcRenderer.on('auth-error', wrappedCallback);
  },
  onAuthSuccess: (callback) => {
    const wrappedCallback = (_: any, tokenResponse: TokenResponse) => callback(tokenResponse);
    ipcRenderer.on('auth-success', wrappedCallback);
    return () => {
      ipcRenderer.removeListener('auth-success', wrappedCallback);
    };
  },
  apiRequest: (config: AxiosRequestConfig) => ipcRenderer.invoke('api-request', config),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
}

contextBridge.exposeInMainWorld('electron', electronAPI);

declare global {
  interface Window {
    electron: PreloadElectronAPI;
  }
}