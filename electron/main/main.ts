import { app, BrowserWindow } from 'electron';
import path from 'path';
// import * as process from "node:process";
// import {defaultServerBinary} from "../../src/utils/utils";
// import {spawn} from "child_process";
import {IpcHandler} from '../ipc/ipc';
import { session } from 'electron';

app.commandLine.appendSwitch('ignore-certificate-errors');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      webSecurity: false,              // CORS 무시
      contextIsolation: true,         // 이게 true면 preload + contextBridge 필요
      nodeIntegration: true,           // 렌더러에서 Node.js 사용 가능
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadURL('https://polite-stone-0c57c411e.6.azurestaticapps.net');
}

// const serverStart = () => {
//   const kopiaPath = defaultServerBinary();
//   const args = [];
//
//   args.push(
//     "server",
//     "start",
//     "--tls-print-server-cert",
//     "--tls-generate-cert-name=127.0.0.1",
//     "--random-password",
//     "--random-server-control-password",
//     "--tls-generate-cert",
//     "--async-repo-connect",
//     "--error-notifications=always",
//     "--kopiaui-notifications",
//     "--shutdown-on-stdin",
//     "--address=127.0.0.1:0"
//   );
//
//   spawn(kopiaPath, args, {});
// }

app.whenReady().then(() => {
  const handler = new IpcHandler();
  handler.setupIPC();
  // serverStart();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});