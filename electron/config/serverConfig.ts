import fs from "fs";
import path from "path";
import Electron from "electron";
import log from "electron-log";

let configs: { [key: string]: any } = {};
const configFileSuffix = ".config";

let myConfigDir = "";
let isPortable = false;
let firstRun = false;

const portableConfigDir = () => {
    let result = [];

    if (process.env.KOPIA_UI_PORTABLE_CONFIG_DIR) {
        result.push(process.env.KOPIA_UI_PORTABLE_CONFIG_DIR);
    }

    if (process.platform === "darwin") {
        result.push(
            path.join(
              path.dirname(Electron.app.getPath("exe")),
              "..",
              "..",
              "..",
              "repositories",
            ),
        );
    } else {
        result.push(
            path.join(path.dirname(Electron.app.getPath("exe")), "repositories"),
        );
        result.push(
            path.join(
                path.dirname(Electron.app.getPath("exe")),
                "..",
                "repositories",
            ),
        );
    }

    return result;
}

const globalConfigDir = () => {
    if (!myConfigDir) {
        portableConfigDir().forEach((dir) => {
            if (myConfigDir) {
                return;
            }

            dir = path.normalize(dir);

            if (!fs.existsSync(dir)) {
                return;
            }

            myConfigDir = dir;
            isPortable = true;
        });

        if (!myConfigDir) {
            myConfigDir = path.join(Electron.app.getPath("appData"), "kopia");
        }
    }

    return myConfigDir;
}

export const allConfigs = () => {
    let result = [];

    for (let k in configs) {
        result.push(k);
    }

    return result;
}

export const addNewConfig = () => {
    let id;

    if (!configs) {
        id = 'repository';
    } else {
        id = 'repository' + new Date().valueOf();
    }

    configs[id] = true;
    return id;
}

Electron.ipcMain.on('config-list-fetch', (event, arg) => {
    emitConfigListUpdated();
})

const emitConfigListUpdated = () => {
    Electron.ipcMain.emit('config-list-updated-event', allConfigs());
}

export const deleteConfigIfDisconnected = (repoID: string) => {
    if (repoID === 'repository') {
        return false
    }

    if (!fs.existsSync(path.join(globalConfigDir(), repoID + configFileSuffix))) {
        delete configs[repoID];
        return true;
    }

    return false;
}

export const loadConfigs = () => {
    fs.mkdirSync(globalConfigDir(), { recursive: true, mode: 0o700 });
    let entries = fs.readdirSync(globalConfigDir());

    let count = 0;
    entries
        .filter((e) => path.extname(e) == configFileSuffix)
        .forEach((v) => {
            const repoID = v.replace(configFileSuffix, "");
            configs[repoID] = true;
            count++;
        });
    
    if (count === 0) {
        configs['repository'] = true;
        firstRun = true;
    }
}

export const isPortableConfig = () => {
    globalConfigDir();
    return isPortable;
}

export const isFirstRun = () => {
    return firstRun;
}

export const configDir = () => {
    return globalConfigDir();
}

export const configForRepo = (repoID: string) => {
    let c = configs[repoID];
    if (c) {
        return configDir();
    }

    configs[repoID] = true;
    emitConfigListUpdated();
    return configDir();
}