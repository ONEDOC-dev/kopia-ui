import { app, BrowserWindow, dialog, ipcMain, screen, shell } from 'electron';
import path from 'path';;
import {IpcHandler} from '../ipc/ipc';
import Store from 'electron-store';
import { WindowManager } from './WindowManager';
import { isPortableConfig, configDir, deleteConfigIfDisconnected, allConfigs, loadConfigs, isFirstRun } from '../config/serverConfig';
import crypto from "crypto";
import { publicPath } from "../utils/serverUtiles";
import log from "electron-log";
import { serverForRepo } from './kopia-server';
import { refreshWillLaunchAtStartup } from './auto-luanch';

const store: Store = new Store();
app.name = 'oneCLOUD';

let mainWindow: BrowserWindow | null = null;

if (process.env.KOPIA_CUSTOM_APPDATA) {
  app.setPath("appData", process.env.KOPIA_CUSTOM_APPDATA);
}

if (isPortableConfig()) {
  // in portable mode, write cache under 'repositories'
  app.setPath("userData", path.join(configDir(), "cache"));
}

const getDisplayConfiguration = () => {
  // Stores the IDs all all currently connected displays
  let config = [];
  let sha256 = crypto.createHash("sha256");
  // Get all displays
  let displays = screen.getAllDisplays();
  let isFactorEqual = false;
  // Stores the previous factor - initialized with the primary scaling factor
  let prevFactor = screen.getPrimaryDisplay().scaleFactor;
  //Workaround until https://github.com/electron/electron/issues/10862 is fixed
  for (let dsp in displays) {
    // Add the id to the config
    config.push(displays[dsp].id);
    isFactorEqual = prevFactor === displays[dsp].scaleFactor;
    // Update the previous factors
    prevFactor = displays[dsp].scaleFactor;
  }
  // Sort IDs to prevent different hashes through permutation
  config.sort();
  sha256.update(config.toString());
  return { hash: sha256.digest("hex"), factorsEqual: isFactorEqual };
}

function showMainWindow() {
  if (mainWindow) {
    mainWindow.focus();
    return;
  }

  let primaryScreenBounds = screen.getPrimaryDisplay().bounds;
  let windowOptions = {
    title: "oneCLOUD is Loading...",
    width: 1000,
    height: 700,
    x: (primaryScreenBounds.width - 1000) / 2,
    y: (primaryScreenBounds.height - 700) / 2,
    autoHideMenuBar: true,
    resizable: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  };

  let configuration = getDisplayConfiguration();
  let winBounds = store.get(configuration.hash);
  let maximized = store.get("maximized");

  if (configuration.factorsEqual) {
    Object.assign(windowOptions, winBounds);
  }

  mainWindow = new BrowserWindow(windowOptions);
  if (maximized) {
    mainWindow.maximize();
  }

  mainWindow.webContents.on("did-fail-load", () => {
    log.error("failed to load content");
    setTimeout(() => {
      log.info("reloading");
      mainWindow?.loadURL('https://gray-rock-0471a3b10.1.azurestaticapps.net');
    }, 500);
  });

  mainWindow.loadURL('https://gray-rock-0471a3b10.1.azurestaticapps.net');

  mainWindow.on("close", function () {
    store.set(getDisplayConfiguration().hash, mainWindow?.getBounds());
    store.set("maximized", mainWindow?.isMaximized());
  });

  mainWindow.once("ready-to-show", function () {
    mainWindow?.show();
  });

  mainWindow.on("closed", function () {
    mainWindow = null;
    // 단일 repository 서버 중지 등 필요시 여기에 추가
  });
}

// Check if another instance of kopia is running
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", (_event, _commandLine, _workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
}

app.on("will-quit", function () {
  // 단일 repository 서버 중지 등 필요시 여기에 추가
});

app.on("login", (event, webContents, _request, _authInfo, callback) => {
  // 단일 repository 기준으로 서버 패스워드 처리
  const password = serverForRepo('repository').getServerPassword();
  if (password) {
    event.preventDefault();
    log.info("automatically logging in...");
    callback("kopia", password);
  }
});

app.on(
  "certificate-error",
  (event, webContents, _url, _error, certificate, callback) => {
    // 단일 repository 기준으로 인증서 처리
    const expected =
      "sha256/" +
      Buffer.from(
        serverForRepo('repository').getServerCertSHA256(),
        "hex",
      ).toString("base64");
    if (certificate.fingerprint === expected) {
      log.debug("accepting server certificate.");
      event.preventDefault();
      callback(true);
      return;
    }
    log.warn("certificate error:", certificate.fingerprint, expected);
  },
);

app.on("window-all-closed", function () {});

ipcMain.handle("select-dir", async (_event, _arg) => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (result.filePaths) {
    return result.filePaths[0];
  } else {
    return null;
  }
});

ipcMain.handle("browse-dir", async (_event, path) => {
  shell.openPath(path);
});

const isOutsideOfApplicationsFolderOnMac = () => {
  if (!app.isPackaged || isPortableConfig()) {
    return false;
  }

  // this method is only available on Mac.
  if (!app.isInApplicationsFolder) {
    return false;
  }

  return !app.isInApplicationsFolder();
}

const maybeMoveToApplicationsFolder = () => {
  if (process.env["KOPIA_UI_TESTING"]) {
    return;
  }

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
    })
    .catch((e) => {
      log.info(e);
    });
}

app.on('ready', () => {
  const handler = new IpcHandler(store, new WindowManager(store));
  handler.setupIPC();
  loadConfigs();

  if (isPortableConfig()) {
    const logDir = path.join(configDir(), "logs");
    log.transports.file.resolvePath = (variables: any) =>
      path.join(logDir, variables.fileName);
  }
  

  log.transports.console.level = "warn";
  log.transports.file.level = "debug";

  refreshWillLaunchAtStartup();

  // 단일 repository 서버 실행
  serverForRepo('repository').actuateServer();

  showMainWindow();

  if (isOutsideOfApplicationsFolderOnMac()) {
    setTimeout(maybeMoveToApplicationsFolder, 1000);
  }
});

// const createWindow = () => {
//   const win = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       webSecurity: false,              // CORS 무시
//       contextIsolation: true,         // 이게 true면 preload + contextBridge 필요
//       nodeIntegration: true,           // 렌더러에서 Node.js 사용 가능
//       preload: path.join(__dirname, 'preload.js')
//     }
//   });
//   win.loadURL('https://polite-stone-0c57c411e.6.azurestaticapps.net');
// }

// app.whenReady().then(() => {
//   const handler = new IpcHandler(store, new WindowManager(store));
//   handler.setupIPC();
//   createWindow();

//   app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) {
//       createWindow();
//     }
//   });
// });

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });