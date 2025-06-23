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

    // 패키지된 앱에서 여러 경로 시도
    const possiblePaths = [
        path.join(process.resourcesPath, 'win', 'kopia.exe'),
        path.join(process.resourcesPath, 'resources', 'win', 'kopia.exe'),
        path.join(path.dirname(process.execPath), 'resources', 'win', 'kopia.exe'),
        path.join(path.dirname(process.execPath), 'win', 'kopia.exe'),
    ];

    // 디버깅: 모든 경로 확인
    console.log('Searching for kopia.exe in:');
    console.log('process.resourcesPath:', process.resourcesPath);
    console.log('process.execPath:', process.execPath);
    
    const fs = require('fs');
    for (const testPath of possiblePaths) {
        console.log('Checking path:', testPath);
        if (fs.existsSync(testPath)) {
            console.log('Found kopia.exe at:', testPath);
            return testPath;
        }
    }

    // 기본 경로들이 모두 실패하면 에러 발생
    throw new Error(`kopia.exe not found. Searched paths:\n${possiblePaths.join('\n')}`);
}

