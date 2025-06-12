import {useCallback} from "react";
import instance from "@/api/v1/index";
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