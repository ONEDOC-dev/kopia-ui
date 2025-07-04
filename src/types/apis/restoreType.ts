export interface RestoreRequest {
  root: string; // 복원할 스냅샷
  options: {
    // 복원 방식 옵션
    incremental: boolean; // 이전에 복원된 파일들을 건너뛰기 // 이미 복원한 파일은 다시 복원하지 않기
    ignoreErrors: boolean; // 오류 발생 시 계속 진행 여부 // 파일 복원 중 문제가 생기면 중단하기
    // 고급 옵션
    restoreDirEntryAtDepth: number; // 얕은 복원 깊이 // 폴더 안의 폴더를 몇 단계까지 복원할지
    minSizeForPlaceholder: number; // 플레이스홀더 최소 크기 // 큰 파일을 임시로 빈 파일로 만들어 놓을 최소 크기
  },
  fsOutput: {
    targetPath: string; // 복원 경로
    // 파일 속성 복원
    skipOwners: boolean; // 파일 소유권 복원 // 누가 파일을 만들었는지 정보는 복원하지 않기
    skipPermissions: boolean; // 파일 권한 복원 // 파일 읽기/쓰기 권한 설정은 복원하지 않기
    skipTimes: boolean; // 파일 수정 시간 복원 // 파일을 언제 만들었는지 날짜 정보는 복원하지 않기
    // 덮어쓰기 옵션
    overwriteFiles: boolean; // 기존 파일 덮어쓰기 // 같은 이름의 파일이 있으면 덮어쓰지 않기
    overwriteDirectories: boolean; // 기존 디렉토리 덮어쓰기 // 같은 이름의 폴더가 있으면 덮어쓰지 않기
    overwriteSymlinks: boolean; // 기존 심볼릭 링크 덮어쓰기 // 같은 이름의 바로가기가 있으면 덮어쓰지 않기
    // 고급 옵션
    ignorePermissionErrors: boolean; // 권한 오류 무시 // 파일 권한 관련 오류가 생겨도 계속 복원하기
    writeFilesAtomically: boolean; // 원자적 파일 쓰기 // 파일을 완전히 복원한 후에 한 번에 저장하기
    writeSparseFiles: boolean; // 스파스 파일 쓰기 // 빈 공간이 많은 파일을 효율적으로 저장하기
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
