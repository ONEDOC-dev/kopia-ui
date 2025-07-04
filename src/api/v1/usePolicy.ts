import instance from "@/api/httpClient";
import {useCallback} from "react";
import {GetPolicyRequest, UpdatePolicyReqeust} from "@/types/apis/policyType";

const usePolicy = () => {
  const getPolicy = useCallback(async (request: GetPolicyRequest) => {
    try {
      const queryString = new URLSearchParams({
        userName: request.userName,
        host: request.host,
        path: request.path
      }).toString();
      return await instance.get(`/policy?${queryString}`);
    } catch (error) {
      return Promise.reject(error);
    }
  }, [instance]);

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
    getPolicy,
    updatePolicy
  };
}

export default usePolicy;