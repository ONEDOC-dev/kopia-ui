export interface pathsResolveRequest {
  path: string;
}

export interface pathsResolveResponse {
  source: {
    host: string;
    userName: string;
    path: string;
  }
}