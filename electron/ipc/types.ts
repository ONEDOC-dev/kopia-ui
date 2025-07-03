import {AxiosRequestConfig} from "axios";

export interface KeycloakConfig {
  realm: string;
  authServerUrl: string;
  clientId: string;
  redirectUri: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
}

export interface SafeAxiosRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
}

export interface PreloadElectronAPI extends ElectronAPI {
  authStart: () => Promise<TokenResponse>;
  onAuthError: (callback: (error: string) => void) => void;
  onAuthSuccess: (callback: (tokenResponse: TokenResponse) => void) => void;  
}

export interface ElectronAPI {
  refreshToken: () => Promise<TokenResponse>;
  apiRequest: (config: AxiosRequestConfig) => Promise<any>;
  selectDirectory: () => Promise<string | null>;
}

export interface IpcElectronAPI extends ElectronAPI {
  setupIPC: () => void;
}