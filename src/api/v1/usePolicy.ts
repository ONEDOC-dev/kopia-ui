import instance from "@/api/v1/index";
import {useCallback} from "react";
import {UpdatePolicyReqeust} from "@/types/apis/policyType";

const usePolicy = () => {
  const updatePolicy = useCallback( async (request: UpdatePolicyReqeust) => {
    try {
      const queryString = new URLSearchParams({
        userName: request.params.userName,
        host: request.params.host,
        path: request.params.path
      }).toString();
      return await instance.put(`/policy?${queryString}`, request.body);
    } catch (error) {
      Promise.reject(error);
    }
  }, [instance]);

  return {
    updatePolicy
  };
}

export default usePolicy;