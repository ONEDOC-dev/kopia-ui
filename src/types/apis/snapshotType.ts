export interface deleteSnapshotRequest {
  source: {
    host: string;
    userName: string;
    path: string;
  },
  snapshotManifestIds?: string[];
  deleteSourceAndPolicy?: boolean; // true: 스냅샷 모두 삭제, false: 세부적인 스냅샷만 삭제
}

export interface getSnapshotRequest {
  userName: string;
  host: string;
  path: string;
}

export interface getSnapshotResponse {
  snapshots: {
    id: string;
    description: string;
    startTime: string;
    endTime: string;
    incomplete?: string; // 불완전한 스냅샷 이유
    summary: {
      size: number;
      files: number;
      symlinks: number;
      dirs: number;
      maxTime: string;
      numFailed: number;
    },
    rootID: string;
    retention: string[], // 보존 정책 목록
    pins: any[] // 고정된 핀 목록
  }[],
  unfilteredCount: number; // 전체 스냅샷 갯수
  uniqueCount: number; // 고유 스냅샷 갯수
}
