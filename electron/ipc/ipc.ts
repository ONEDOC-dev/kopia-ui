import {IpcElectronAPI, TokenResponse} from "./types";
import Store from "electron-store";
import {WindowManager} from "../main/WindowManager";
import {ipcMain} from 'electron';
import {DEFAULT_WINDOW_NAME} from "./const";
import {getAuthUrl, refreshToken} from "../main/auth";
import axios, {AxiosError, AxiosRequestConfig} from "axios";
// import {getServerAddress} from "../main/kopia-server";

export class IpcHandler implements IpcElectronAPI {
  private store: Store;
  private windowManager: WindowManager;

  constructor(store: Store, windowManager: WindowManager) {
    this.store = store;
    this.windowManager = windowManager;
  }

  public setupIPC(): void {
    ipcMain.handle('get-auth-tokens', this.getAuthTokens.bind(this));
    ipcMain.handle('refresh-token', this.refreshToken.bind(this));
    ipcMain.handle('store-auth-tokens',
      (_event, tokenResponse: TokenResponse) => this.storeAuthTokens.bind(tokenResponse));
    ipcMain.handle('auth-start', this.startAuth.bind(this));
    ipcMain.handle('api-request', (_, config: AxiosRequestConfig) => this.apiRequest(config));
  }

  public async apiRequest(config: AxiosRequestConfig): Promise<any>{
    try {
      const fullConfig: AxiosRequestConfig = {
        ...config,
        baseURL: `http://localhost:51515/api/v1`,
        url: config.url?.startsWith('/') ? config.url : `/${config.url}`,
      };
      
      // 순환 참조를 피하기 위해 axios를 직접 사용
      const res = await axios(fullConfig);
      return { success: true, data: res.data };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message,
          name: error.name,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          response: {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
          }
        }
      };
    }
  }

  public async startAuth(): Promise<void> {
    try {
      await this.refreshToken();
    } catch (e) {
      const authWindow = this.windowManager.get(DEFAULT_WINDOW_NAME.AUTH);
      if (!authWindow) return;
      await authWindow.loadURL(getAuthUrl());
      authWindow.show();
      authWindow.focus();
      const mainWindow = this.windowManager.get(DEFAULT_WINDOW_NAME.MAIN);
      mainWindow?.webContents.send('auth-error', "");
    }
  }
  
  public async getAuthTokens(): Promise<{ access_token: string | null; refresh_token: string | null }> {
    return {
      access_token: this.store.get('access_token') as string | null,
      refresh_token: this.store.get('refresh_token') as string | null
    };
  }
  
  public async storeAuthTokens(tokenResponse: TokenResponse): Promise<void> {
    this.updateTokens(tokenResponse);
  }
  
  public async refreshToken(): Promise<TokenResponse> {
    const refreshTokenValue = this.store.get('refresh_token') as string | undefined;
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }
  
    try {
      const tokenResponse = await refreshToken(refreshTokenValue);
      this.updateTokens(tokenResponse);
      return tokenResponse;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error('Failed to refresh token');
    }
  }
  
  private updateTokens(tokenResponse: TokenResponse): void {
    this.store.set('access_token', tokenResponse.access_token);
    this.store.set('refresh_token', tokenResponse.refresh_token);
    const mainWindow = this.windowManager.get(DEFAULT_WINDOW_NAME.MAIN);
    mainWindow?.webContents.send('auth-success', tokenResponse);
  }
}

// export function setupIPC(store: Store, windowManager: WindowManager): IpcHandler {
//   const handler = new IpcHandler(store, windowManager);
//   handler.setupIPC();
//   return handler;
// }