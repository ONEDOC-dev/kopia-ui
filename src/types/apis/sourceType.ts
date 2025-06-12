export interface getSourceResponse {
  localUsername: string
  localHost: string;
  multiUser: boolean;
  sources: {
    source: {
      host: string;
      userName: string;
      path: string;
    },
    status: string;
    schedule: {
      timeOfDay?: {
        hour: number;
        min: number;
      }[],
      runMissed: boolean;
    },
    lastSnapshot: {
      id: string;
      source: {
        host: string;
        userName: string;
        path: string;
      },
      description: string;
      startTime: string;
      endTime: string;
      stats: {
        totalSize: number;
        excludedTotalSize: number;
        fileCount: number;
        cachedFiles: number;
        nonCachedFiles: number;
        dirCount: number;
        excludedFileCount: number;
        excludedDirCount: number;
        ignoredErrorCount: number;
        errorCount: number;
      },
      rootEntry: {
        name: string;
        type: string;
        mode: string;
        mtime: string;
        uid: number;
        gid: number;
        obj: string;
        summ: {
          size: number;
          files: number;
          symlinks: number;
          dirs: number;
          maxTime: string;
          numFailed: number;
        }
      }
    },
    nextSnapshotTime?: string;
    upload?: {
      cachedBytes: number;
      hashedBytes: number;
      uploadedBytes: number;
      estimatedBytes: number;
      cachedFiles: number;
      hashedFiles: number;
      excludedFiles: number;
      excludedDirs: number;
      errors: number;
      ignoredErrors: number;
      estimatedFiles: number;
      directory: string;
      lastErrorPath: string;
      lastError: string;
    },
    currentTask?: string;
  }[];
}

interface setSourceScheduling{
  hour: number;
  minute: number;
}

export interface setSourceRequest {
  path: string;
  createSnapshot: boolean;
  policy: {
    scheduling: {
      timeOfDay: setSourceScheduling[]
    },
  }
}

export interface setSourceResponse {
  snapshotted: boolean;
}

export interface uploadSourceRequest {
  userName: string;
  host: string;
  path: string;
}

export interface uploadSourceResponse {
  source: {
    [key: string]: {
      success: boolean;
    }
  }
}