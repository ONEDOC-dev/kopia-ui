import {useCallback} from "react";
import instance from "@/api/v1/index";
import {RestoreRequest, RestoreResponse} from "@/types/apis/restoreType";

const useRestore = () => {
  const restore = useCallback(async (request: RestoreRequest): Promise<RestoreResponse> => {
    try {
      return await instance.post('/restore', request);
    } catch (error) {
      return Promise.reject(error);
    }
  }, [instance]);

  return {
    restore
  }
}

export default useRestore;