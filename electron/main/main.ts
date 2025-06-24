import { app, BrowserWindow, dialog, ipcMain, screen, shell } from 'electron';
import path from 'path';;
import {IpcHandler} from '../ipc/ipc';
import Store from 'electron-store';
import { isPortableConfig, configDir, loadConfigs, isFirstRun } from '../config/serverConfig';
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

const showMainWindow = () => {
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

  mainWindow = new BrowserWindow(windowOptions);

  mainWindow.loadURL('https://gray-rock-0471a3b10.1.azurestaticapps.net');

  mainWindow.once("ready-to-show", function () {
    mainWindow?.show();
  });

  mainWindow.on("closed", function () {
    mainWindow = null;
    serverForRepo().stopServer();
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

app.on("window-all-closed", function () {
  app.quit();
});

app.on("will-quit", function () {
  console.log("will-quit 이벤트 발생!");
  serverForRepo().stopServer();
});

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

// mac에서 앱이 어플레케이션에 등록이 안되어 있을 경우
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
  const handler = new IpcHandler();
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
  
  showMainWindow(); 
  // 단일 repository 서버 실행
  serverForRepo().actuateServer();


  if (isOutsideOfApplicationsFolderOnMac()) {
    setTimeout(maybeMoveToApplicationsFolder, 1000);
  }
});