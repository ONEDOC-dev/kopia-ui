import {useCallback} from "react";
import instance from "@/api/httpClient";
import {getCurrentUserResponse} from "@/types/apis/currentUserTypes";

const useCurrentUser = () => {
  const getCurrentUser = useCallback(async (): Promise<getCurrentUserResponse> => {
    try {
      return await instance.get('current-user');
    } catch (error) {
      return Promise.reject(error);
    }
  }, [instance]);

  return {
    getCurrentUser
  }
}

export default useCurrentUser