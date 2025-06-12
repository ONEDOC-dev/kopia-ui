import instance from "./index";
import {useCallback} from "react";
import {
  connectRepositoryRequest,
  createRepositoryRequest,
  getAlgorithmsResponse,
  getRepositoryStatusResponse
} from "@/types/apis/repoTypes";

const useRepoApi = () => {

  const getRepositoryStatus = useCallback(async (): Promise<getRepositoryStatusResponse> => {
    try {
      return await instance.get('/repo/status');
    } catch (error) {
      return Promise.reject(error);
    }
  }, [instance]);

  const getAlgorithms = useCallback(async (): Promise<getAlgorithmsResponse> => {
    try {
      return await instance.get('/repo/algorithms');
    } catch (error) {
      return Promise.reject(error);
    }
  }, [instance]);

  const repositoryExists = useCallback(async (request: any) => {
    try {
      return await instance.post('/repo/exists', request);
    } catch (error) {
      return Promise.reject(error);
    }
  }, [instance]);

  const createRepository = useCallback(async (request: createRepositoryRequest) => {
    try {
      return await instance.post('/repo/create', request);
    } catch (error) {
      return Promise.reject(error);
    }
  }, [instance]);

  const connectToRepository = useCallback(async (request: connectRepositoryRequest) => {
    try {
      return await instance.post('/repo/connect', request);
    } catch (error) {
      return Promise.reject(error);
    }
  }, [instance]);

  const updateDescription = useCallback(async (description: string) => {
    try {
      return await instance.post('/repo/description', { description: description });
    } catch (error) {
      return Promise.reject(error);
    }
  }, [instance]);

  const disconnect = useCallback(async () => {
    try {
      return await instance.post('/repo/disconnect');
    } catch (error) {
      return Promise.reject(error);
    }
  }, [instance]);

  return {
    getRepositoryStatus,
    getAlgorithms,
    repositoryExists,
    createRepository,
    connectToRepository,
    updateDescription,
    disconnect,
  }
}

export default useRepoApi;