import dayjs from "dayjs";

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