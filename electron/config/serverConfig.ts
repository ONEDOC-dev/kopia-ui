import fs from "fs";
import path from "path";
import Electron from "electron";
import log from "electron-log";

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

export const deleteConfigIfDisconnected = () => {
    // 단일 config만 관리하므로, config 파일이 없으면 true 반환
    const configPath = path.join(globalConfigDir(), 'repository' + configFileSuffix);
    if (!fs.existsSync(configPath)) {
        return true;
    }
    return false;
}

export const loadConfigs = () => {
    fs.mkdirSync(globalConfigDir(), { recursive: true, mode: 0o700 });
    let entries = fs.readdirSync(globalConfigDir());
    let found = entries.some((e) => e === 'repository' + configFileSuffix);
    if (!found) {
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

export const configForRepo = () => {
    // 단일 config 디렉토리 반환
    return configDir();
}