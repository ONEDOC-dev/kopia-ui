export interface RestoreRequest {
  root: string;
  options: {
    incremental: boolean;
    ignoreErrors: boolean;
    restoreDirEntryAtDepth: number;
    minSizeForPlaceholder: number;
  },
  fsOutput: {
    targetPath: string;
    skipOwners: boolean;
    skipPermissions: boolean;
    skipTimes: boolean;
    ignorePermissionErrors: boolean;
    overwriteFiles: boolean;
    overwriteDirectories: boolean;
    overwriteSymlinks: boolean;
    writeFilesAtomically: boolean;
    writeSparseFiles: boolean;
  }
}

export interface RestoreResponse {
  id: string;
  startTime: string;
  kind: string;
  description: string;
  status: string;
  progressInfo: string;
  counters: {
    "Ignored Errors": {
      value: number;
      level: string;
    },
    "Restored Bytes": {
      value: number;
      units: string;
      level: string;
    },
    "Restored Directories": {
      value: number;
      level: string;
    },
    "Restored Files": {
      value: number;
      level: string;
    },
    "Restored Symlinks": {
      value: number;
      level: string;
    },
    "Skipped Bytes": {
      value: number;
      units: string;
      level: string;
    },
    "Skipped Files": {
      value: number;
      level: string;
    }
  }
}
