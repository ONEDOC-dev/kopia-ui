export interface SnapshotCounters {
  "Cached Bytes": {
    value: number;
    units: string;
    level: string;
  },
  "Cached Files": {
    value: number;
    level: string;
  },
  "Errors": {
    value: number;
    level: string;
  },
  "Excluded Directories": {
    value: number;
    level: string;
  },
  "Excluded Files": {
    value: number;
    level: string;
  },
  "Hashed Bytes": {
    value: number;
    units: string;
    level: string;
  },
  "Hashed Files": {
    value: number;
    level: string;
  },
  "Processed Bytes": {
    value: number;
    units: string;
    level: string;
  },
  "Processed Files": {
    value: number;
    level: string;
  },
  "Uploaded Bytes": {
    value: number;
    units: string;
    level: string;
  }
}

export interface RestoreCounters {
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
    value: number
    units: string;
    level: string;
  },
  "Skipped Files": {
    value: number
    level: string;
  }
}

export interface TasksResponse {
  id: string;
  startTime: string;
  endTime?: string;
  kind: 'Maintenance' | 'Snapshot' | 'Restore' | 'Repository';
  description: string;
  status: string;
  progressInfo: string;
  errorMessage?: string;
  counters: SnapshotCounters | RestoreCounters | null
}
