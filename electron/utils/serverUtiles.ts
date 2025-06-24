import { app } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const publicPath = () => {
    if (!app.isPackaged) {
        return path.join(__dirname, "..", "public");
    }
    return process.resourcesPath;
}

const osShortName = (function () {
    switch (process.platform) {
      case "win32":
        return "win";
      case "darwin":
        return "mac";
      case "linux":
        return "linux";
      default:
        return null;
    }
})();

export const defaultServerBinary = () => {
    if (!osShortName) {
        throw new Error(`Unsupported platform: ${process.platform}`);
    }

    if (!app.isPackaged) {
        // 개발 모드에서는 프로젝트 루트 기준으로 절대 경로 사용
        const projectRoot = process.cwd();
        const binaries = {
            mac: path.join(projectRoot, 'resources', 'mac', 'kopia'),
            win: path.join(projectRoot, 'resources', 'win', 'kopia.exe'),
            linux: path.join(projectRoot, 'resources', 'linux', 'kopia'),
        };
        return binaries[osShortName as 'win' | 'mac' | 'linux'];
    }

    const binaries = {
        mac: path.join(process.resourcesPath, 'server', 'mac', 'kopia'),
        win: path.join(process.resourcesPath, 'server', 'win', 'kopia.exe'),
        linux: path.join(process.resourcesPath, 'server', 'linux', 'kopia'),
    };
    return binaries[osShortName as 'win' | 'mac' | 'linux'];
}

