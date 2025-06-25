import { app, BrowserWindow, Display, globalShortcut, screen } from 'electron';
import Store from 'electron-store';
import path from 'path';
import { DEFAULT_WINDOW_NAME } from '../ipc/const';
import { IpcHandler } from '../ipc/ipc';
import { WindowManager } from './WindowManager';
import { serverForRepo } from './kopia-server';

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
  private readonly MAIN_WINDOW_URL = `https://gray-rock-0471a3b10.1.azurestaticapps.net`;
  private readonly store: Store;
  private mainWindow!: BrowserWindow;
  private authWindow: BrowserWindow | null = null;
  private readonly windowManager: WindowManager;
  private disabledReloadWindowId: Set<number> = new Set();

  constructor () {
    this.store = new Store();
    this.windowManager = new WindowManager(this.store);
  }

  public async init() {
    app.commandLine.appendSwitch('enable-features','SharedArrayBuffer');

    await app.whenReady();
    
    const handler = new IpcHandler(this.store, this.windowManager);
    handler.setupIPC();

    serverForRepo().actuateServer();
    this.createWindows();
    this.createAuthWindow();
    this.setupAppInfo();
    this.setupAppEvents();
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

    this.mainWindow.webContents.on('did-fail-load', () => {
      console.error('failed to load content');
      setTimeout(() => {
        console.log('reloading');
        this.mainWindow.loadURL(this.MAIN_WINDOW_URL);
      }, 500);
    });
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
    this.authWindow.on('closed', () => {
      app.quit();
    });
  }

  private async setupAppInfo() {
    app.name = 'oneCLOUD';
  }

  private setupAppEvents() {
    const handleReload = () => {
      const window = BrowserWindow.getFocusedWindow();
      if (!window) return;
      if (this.disabledReloadWindowId.has(window.id)) return;
      BrowserWindow.getFocusedWindow()?.reload();
    }    
    globalShortcut.register('CommandOrControl+R', handleReload);
    globalShortcut.register('F5', handleReload);

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

    app.on('window-all-closed', () => {
      serverForRepo().stopServer();
      if (process.platform === 'darwin') app.quit();
    });
    
  }

}

const electronApp = new ElectronApp();
electronApp.init().catch(console.error);