import dayjs from "dayjs";
import {app} from "electron";
// import * as path from "path";

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '-';

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  const rounded = Math.round(value * 10) / 10; // 소수점 둘째 자리에서 반올림

  return `${rounded.toFixed(1)} ${units[i]}`;
}

export const padTwoDigits = (input: number | string): string => {
  try {
    const num = typeof input === 'string' ? parseInt(input, 10) : input;
    return num.toString().padStart(2, '0');
  } catch (_) {
    return '-'
  }
}

export const formatDates = (date: string) => {
  return dayjs(date, 'YYYYMMDDHHmmss.SSSZ').isValid() ? dayjs(date, 'YYYYMMDDHHmmss.SSSZ').format('YYYY-MM-DD HH:mm:ss') : date;
}

// export const osShortName = (function () {
//   switch (process.platform) {
//     case "win32":
//       return "win";
//     case "darwin":
//       return "mac";
//     case "linux":
//       return "linux";
//     default:
//       return null;
//   }
// })();

// export const defaultServerBinary = () => {
//   if (!osShortName) {
//     throw new Error(`Unsupported platform: ${process.platform}`);
//   }

//   if (!app.isPackaged) {
//     return {
//       mac: path.join(
//         __dirname,
//         "..",
//         "..",
//         "..",
//         "resources",
//         "mac",
//         "kopia",
//       ),
//       win: path.join(
//         __dirname,
//         "..",
//         "..",
//         "..",
//         "resources",
//         "win",
//         "kopia.exe",
//       ),
//       linux: path.join(
//         __dirname,
//         "..",
//         "..",
//         "..",
//         "resources",
//         "linux",
//         "kopia",
//       ),
//     }[osShortName];
//   }

//   return {
//     mac: path.join(process.resourcesPath, "mac", "kopia"),
//     win: path.join(process.resourcesPath, "win", "kopia.exe"),
//     linux: path.join(process.resourcesPath, "linux", "kopia"),
//   }[osShortName];
// }