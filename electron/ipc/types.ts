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

export interface PreloadElectronAPI {
  // authStart: () => Promise<TokenResponse>;
  // onAuthError: (callback: (error: string) => void) => void;
  // onAuthSuccess: (callback: (tokenResponse: TokenResponse) => void) => void;
  apiRequest: (config: AxiosRequestConfig) => Promise<any>;
}

// export interface ElectronAPI extends PreloadElectronAPI {
  // getAuthTokens: () => Promise<{ access_token: string | null; refresh_token: string | null }>;
  // storeAuthTokens: (tokenResponse: TokenResponse) => Promise<void>;
  // refreshToken: () => Promise<TokenResponse>;
// }

export interface IpcElectronAPI extends PreloadElectronAPI {
  setupIPC: () => void;
}