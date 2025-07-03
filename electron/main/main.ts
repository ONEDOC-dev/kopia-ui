import { app, BrowserWindow, dialog, Display, globalShortcut, screen, Event as ElectronEvent } from 'electron';
import Store from 'electron-store';
import path from 'path';
import { DEFAULT_WINDOW_NAME } from '../ipc/const';
import { IpcHandler } from '../ipc/ipc';
import { WindowManager } from './WindowManager';
import { serverForRepo } from './kopia-server';
import { isPortableConfig } from '../config/serverConfig';
import { TokenResponse } from '../types';
import { exchangeCodeForToken } from './auth';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isFullScreen: boolean;
  displayId: number;
}

class ElectronApp {
  private readonly MAIN_WINDOW_TITLE = `oneCLOUD ${app.getVersion()}`;
  private readonly MAIN_WINDOW_URL = process.env.NODE_ENV === 'development' || !app.isPackaged 
    ? 'http://localhost:3000' 
    : 'https://gray-rock-0471a3b10.1.azurestaticapps.net';
  private readonly store: Store;
  private mainWindow!: BrowserWindow;
  private authWindow: BrowserWindow | null = null;
  private readonly windowManager: WindowManager;
  private keycloakCallbackData: Record<string, string> = {};

  constructor () {
    this.store = new Store();
    this.windowManager = new WindowManager(this.store);
  }

  public async init() {
    app.commandLine.appendSwitch('enable-features','SharedArrayBuffer');

    if (this.setupProtocolHandler()) {
      await app.whenReady();
      app.on('certificate-error', this.onCertificateError.bind(this));
      
      const handler = new IpcHandler(this.store, this.windowManager);
      handler.setupIPC();
  
      serverForRepo().actuateServer();
      this.createWindows();
      this.createAuthWindow();
      this.setupAppInfo();
      this.setupAppEvents();
      await this.loadAllKeycloakCallbackData();
  
      if (this.isOutsideOfApplicationsFolderOnMac()) {
        setTimeout(this.maybeMoveToApplicationsFolder, 1000);
      }
    }
  }

  private getWindowBounceInfo(windowName: string, display: Display) {
    const windowPosInfoKey = `window-info-${windowName}`;
    const windowPosInfo: WindowState | undefined = (this.store.get(windowPosInfoKey)) as any;
    const defaultOptions: WindowState = {
      width: display.bounds.width - 200,
      height: display.bounds.height - 200,
      x: display.workArea.x,
      y: display.workArea.y,
      displayId: -1,
      isFullScreen: true,
    };
    if (windowPosInfo) {
      defaultOptions.x = windowPosInfo.x ?? display.workArea.x;
      defaultOptions.y = windowPosInfo.y ?? display.workArea.y;
      defaultOptions.isFullScreen = windowPosInfo.isFullScreen;
      defaultOptions.width = windowPosInfo.width;
      defaultOptions.height = windowPosInfo.height;
    }
    return defaultOptions;
  }

  private async createWindows() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const defaultOptions: WindowState = this.getWindowBounceInfo(DEFAULT_WINDOW_NAME.MAIN, primaryDisplay);

    this.mainWindow = new BrowserWindow({
      title: this.MAIN_WINDOW_TITLE,
      titleBarStyle: 'default',
      width: defaultOptions.width,
      height: defaultOptions.height,
      x: defaultOptions.x,
      y: defaultOptions.y,
      frame: true,
      fullscreen: false,
      fullscreenable: true,
      resizable: true,
      autoHideMenuBar: true,
      backgroundColor: '#000000',
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      }
    });

    this.mainWindow.loadURL(this.MAIN_WINDOW_URL);

    this.windowManager.addWindow(DEFAULT_WINDOW_NAME.MAIN, this.mainWindow);
    this.windowManager.setListenWindowBounceState(DEFAULT_WINDOW_NAME.MAIN);

    if (!defaultOptions.isFullScreen) {
      this.mainWindow.setMinimizable(true);
      this.mainWindow.setFullScreen(false);
    }    
  }

  private async createAuthWindow() {
    this.authWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      resizable: false,
      fullscreen: false,
      parent: this.mainWindow,
      frame: false,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
        partition: 'persist:shared-session',
        contextIsolation: false
      }
    });

    this.windowManager.addWindow(DEFAULT_WINDOW_NAME.AUTH, this.authWindow);
  }

  private async setupAppInfo() {
    app.name = 'oneCLOUD';
  }

  private setupAppEvents() {
    if (!app.requestSingleInstanceLock()) {
      app.quit();
    } else {
      app.on('second-instance', (_event, _commandLine, _workingDirectory) => {
        if (this.mainWindow) {
          if (this.mainWindow.isMinimized() || !this.mainWindow.isVisible()) {
            this.mainWindow.show();
          }
          this.mainWindow.focus();
        }
      })
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindows();
      }
    });

    app.on('window-all-closed', async () => {
      await serverForRepo().stopServer();
      app.quit();
    });

    app.setLoginItemSettings({
      openAtLogin: true,
    });
    
  }

  private isOutsideOfApplicationsFolderOnMac() {
    if (!app.isPackaged || isPortableConfig()) {
      return false;
    }
  
    // this method is only available on Mac.
    if (!app.isInApplicationsFolder) {
      return false;
    }
  
    return !app.isInApplicationsFolder();
  }

  private maybeMoveToApplicationsFolder() {
    dialog
      .showMessageBox({
        buttons: ["Yes", "No"],
        message:
          "For best experience, Kopia needs to be installed in Applications folder.\n\nDo you want to move it now?",
      })
      .then((r) => {
        if (r.response == 0) {
          app.moveToApplicationsFolder();
        } else {
          // checkForUpdates(); // 자동 업데이트 비활성화로 주석 처리
        }
      });
  }

  private setupProtocolHandler(): Boolean {
    if (process.defaultApp) {
      if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('onecloud', process.execPath, [path.resolve(process.argv[1])])
      }
    } else {
      app.setAsDefaultProtocolClient('onecloud')
    }
    if (process.platform !== 'darwin') {
      const gotTheLock = app.requestSingleInstanceLock()
      if (!gotTheLock) {
        return false;
      } else {
        app.on('second-instance', (_, commandLine) => {
          const schemaData = commandLine.find(arg => arg.startsWith("onecloud://"));
          if (schemaData) this.handleOpenUrl(new Event('open-url'), schemaData);
        });
      }
    } else {
      app.on('open-url', this.handleOpenUrl.bind(this));
    }
    return true;
  }

  private async handleOpenUrl(event: ElectronEvent, url: string): Promise<void> {
    event.preventDefault();

    const urlObj = new URL(url);
    if (urlObj.hostname === 'auth_redirect') {
      const code = urlObj.hash.match(/code=([^&]*)/)?.[1] ?? urlObj.searchParams.get('code');
      const error = urlObj.hash.match(/error=([^&]*)/)?.[1] ?? urlObj.searchParams.get('error');
      const state = urlObj.hash.match(/state=([^&]*)/)?.[1] ?? urlObj.searchParams.get('state');

      if (error) {
        this.handleAuthError(new Error(error));
        return;
      }
      if (code && this.authWindow) {
        try {
          let keycloakData;
          if (state) keycloakData = this.getKeycloakCallbackData(state);
          const tokenResponse = await exchangeCodeForToken(code, keycloakData?.pkceCodeVerifier);
          this.handleSuccessfulAuth(tokenResponse);
        } catch (error) {
          this.handleAuthError(error);
        }
      }
      return
    } else if (urlObj.hostname === 'auth_logout_redirect') {
      this.handleLogoutAuth()
    }
  }

  private handleSuccessfulAuth(tokenResponse: TokenResponse): void {
    this.store.set('access_token', tokenResponse.access_token);
    this.store.set('refresh_token', tokenResponse.refresh_token);
    this.authWindow?.hide();
    this.mainWindow?.show();
    this.mainWindow?.webContents.send('auth-success', tokenResponse);
  }

  private handleLogoutAuth(): void {
    this.store.delete('access_token');
    this.store.delete('refresh_token');
    this.mainWindow?.reload();
  }

  private handleAuthError(error: unknown): void {
    console.error('Token exchange error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    this.mainWindow?.webContents.send('auth-error', errorMessage);
  }

  private getKeycloakCallbackData(state: string) {
    const data = this.keycloakCallbackData[`kc-callback-${state}`];
    if (data) {
      return JSON.parse(data);
    }
    return {};
  }

  private async loadAllKeycloakCallbackData() {
    const rawData = await this.mainWindow?.webContents.executeJavaScript(`
      Object.keys(localStorage).reduce((obj, key) => {
        if (key.startsWith('kc-callback-')) {
          obj[key] = localStorage.getItem(key);
        }
        return obj;
      }, {})
    `);
    if (rawData) {
      this.keycloakCallbackData = rawData;
    }
  }

  private onCertificateError(
    event: ElectronEvent,
    _webContents: any,
    _url: string,
    _error: string,
    _certificate: any,
    callback: Function
  ) {
    event.preventDefault();
    callback(true);
  }

}

const electronApp = new ElectronApp();
electronApp.init().catch(console.error);