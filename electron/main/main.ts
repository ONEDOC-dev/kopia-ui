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

let tray: any = null;
let repositoryWindows: any = {};
let repoIDForWebContents: any = {};

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

/**
 * Creates a repository window with given options and parameters
 * @param {*} repositoryID
 * The id for that specific repository used as a reference for that window
 */
const showRepoWindow = (repositoryID: string) => {
  let primaryScreenBounds = screen.getPrimaryDisplay().bounds;
  if (repositoryWindows[repositoryID]) {
    repositoryWindows[repositoryID].focus();
    return;
  }

  let windowOptions = {
    title: "oneCLOUD is Loading...",
    // default width
    width: 1000,
    // default height
    height: 700,
    // default x location
    x: (primaryScreenBounds.width - 1000) / 2,
    // default y location
    y: (primaryScreenBounds.height - 700) / 2,
    autoHideMenuBar: true,
    resizable: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  };

  // The bounds of the windows
  let configuration = getDisplayConfiguration();
  let winBounds = store.get(configuration.hash);
  let maximized = store.get("maximized");

  if (configuration.factorsEqual) {
    Object.assign(windowOptions, winBounds);
  }

  // Create the browser window
  let repositoryWindow: BrowserWindow | null = new BrowserWindow(windowOptions);
  // If the window was maximized, maximize it
  if (maximized) {
    repositoryWindow.maximize();
  }
  const webContentsID = repositoryWindow.webContents.id;
  repositoryWindows[repositoryID] = repositoryWindow;
  repoIDForWebContents[webContentsID] = repositoryID;

  // Failed to load the content, retry
  repositoryWindow.webContents.on("did-fail-load", () => {
    log.error("failed to load content");

    // schedule another attempt in 0.5s
    if (repositoryWindows[repositoryID]) {
      setTimeout(() => {
        log.info("reloading");
        repositoryWindows[repositoryID].loadURL(
          'https://gray-rock-0471a3b10.1.azurestaticapps.net'
        );
      }, 500);
    }
  });

  repositoryWindow.loadURL(
    'https://gray-rock-0471a3b10.1.azurestaticapps.net'
  );

  /**
   * Store the window size, height and position on close
   */
  repositoryWindow.on("close", function () {
    store.set(getDisplayConfiguration().hash, repositoryWindow?.getBounds());
    store.set("maximized", repositoryWindow?.isMaximized());
  });

  /**
   * Show the window once the content is ready
   */
  repositoryWindow.once("ready-to-show", function () {
    repositoryWindow?.show();
  });

  /**
   * Delete references to the repository window
   */
  repositoryWindow.on("closed", function () {
    // Delete the reference to the window
    repositoryWindow = null;
    delete repositoryWindows[repositoryID];
    delete repoIDForWebContents[webContentsID];

    const s = serverForRepo(repositoryID);
    if (deleteConfigIfDisconnected(repositoryID)) {
      s.stopServer();
    }
  });
}

// Check if another instance of kopia is running
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", (_event, _commandLine, _workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    for (let repositoryID in repositoryWindows) {
      let rw = repositoryWindows[repositoryID];
      if (rw.isMinimized()) {
        rw.restore();
      }
      rw.focus();
    }
  });
}

app.on("will-quit", function () {
  allConfigs().forEach((repositoryID: string) =>
    serverForRepo(repositoryID).stopServer(),
  );
});

app.on("login", (event, webContents, _request, _authInfo, callback) => {
  const repositoryID = repoIDForWebContents[webContents.id];

  // intercept password prompts and automatically enter password that the server has printed for us.
  const password = serverForRepo(repositoryID).getServerPassword();
  if (password) {
    event.preventDefault();
    log.info("automatically logging in...");
    callback("kopia", password);
  }
});

app.on(
  "certificate-error",
  (event, webContents, _url, _error, certificate, callback) => {
    const repositoryID = repoIDForWebContents[webContents.id];
    // intercept certificate errors and automatically trust the certificate the server has printed for us.
    const expected =
      "sha256/" +
      Buffer.from(
        serverForRepo(repositoryID).getServerCertSHA256(),
        "hex",
      ).toString("base64");
    if (certificate.fingerprint === expected) {
      log.debug("accepting server certificate.");

      // On certificate error we disable default behaviour (stop loading the page)
      // and we then say "it is all fine - true" to the callback
      event.preventDefault();
      callback(true);
      return;
    }

    log.warn("certificate error:", certificate.fingerprint, expected);
  },
);

/**
 * Ignore to let the application run, when all windows are closed
 */
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

/**
 * Show all repository windows at once
 */
function showAllRepoWindows() {
  allConfigs().forEach(showRepoWindow);
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

  allConfigs().forEach((repoID) => serverForRepo(repoID).actuateServer());

  if (isFirstRun()) {
    showAllRepoWindows();
  }

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