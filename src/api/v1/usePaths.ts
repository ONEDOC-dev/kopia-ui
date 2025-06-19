import {useCallback} from "react";
import instance from "@/api/httpClient";
import {pathsResolveRequest, pathsResolveResponse} from "@/types/apis/pathsTypes";

const usePaths = () => {
  const pathsResolve = useCallback(async (request: pathsResolveRequest): Promise<pathsResolveResponse> => {
    try {
      return await instance.post('/paths/resolve', request);
    } catch (error) {
      return Promise.reject(error);
    }
  }, [instance]);

  return {
    pathsResolve,
  }
}

export default usePaths;