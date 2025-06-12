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
    summary: {
      size: number;
      files: number;
      symlinks: number;
      dirs: number;
      maxTime: string;
      numFailed: number;
    },
    rootID: string;
    retention: string[],
    pins: any[]
  }[],
  unfilteredCount: number;
  uniqueCount: number;
}
