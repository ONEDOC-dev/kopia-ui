import {useCallback} from "react";
import instance from "@/api/httpClient";
import {
  getSourceResponse,
  setSourceRequest,
  setSourceResponse,
  uploadSourceRequest,
  uploadSourceResponse
} from "@/types/apis/sourceType";

const useSource = () => {

  const getSources = useCallback(async (): Promise<getSourceResponse> => {
    try {
      return await instance.get('/sources');
    } catch (error) {
      return Promise.reject(error);
    }
  }, [instance]);

  const setSource = useCallback(async (request: setSourceRequest): Promise<setSourceResponse> => {
    try {
      return await instance.post('/sources', request);
    } catch (error) {
      return Promise.reject(error);
    }
  }, [instance]);

  const uploadSource = useCallback(async (request: uploadSourceRequest): Promise<uploadSourceResponse> => {
    try {
      const queryString = new URLSearchParams({
        userName: request.userName,
        host: request.host,
        path: request.path
      }).toString();
      return await instance.post(`/sources/upload?${queryString}`);
    } catch (error) {
      return Promise.reject(error);
    }
  }, [instance]);

  return {
    getSources,
    setSource,
    uploadSource,
  }

}

export default useSource;