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

export interface PreloadElectronAPI {
  authStart: () => Promise<TokenResponse>;
  onAuthError: (callback: (error: string) => void) => void;
  onAuthSuccess: (callback: (tokenResponse: TokenResponse) => void) => void;
}

export interface ElectronAPI {
  getAuthTokens: () => Promise<{ access_token: string | null; refresh_token: string | null }>;
  storeAuthTokens: (tokenResponse: TokenResponse) => Promise<void>;
  refreshToken: () => Promise<TokenResponse>;
}

export interface IpcElectronAPI extends ElectronAPI {
  setupIPC: () => void;
}