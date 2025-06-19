import {useCallback} from "react";
import instance from "@/api/httpClient";
import {deleteSnapshotRequest, getSnapshotRequest, getSnapshotResponse} from "@/types/apis/snapshotType";

const useSnapshot = () => {

  const deleteSnapshot = useCallback(async (request: deleteSnapshotRequest) => {
    try {
      return await instance.post('/snapshots/delete', request);
    } catch (error) {
      return Promise.reject(error);
    }
  }, [instance]);

  const getSnapshot = useCallback(async (request: getSnapshotRequest): Promise<getSnapshotResponse> => {
    const params = new URLSearchParams({
      userName: request.userName,
      host: request.host,
      path: request.path,
    }).toString();
    try {
      return await instance.get(`/snapshots?${params}`);
    } catch (error) {
      return Promise.reject(error);
    }
  }, [instance]);

  return {
    deleteSnapshot,
    getSnapshot
  }

}

export default useSnapshot;