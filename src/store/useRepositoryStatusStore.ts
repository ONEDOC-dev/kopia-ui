import {create} from 'zustand'
import {getRepositoryStatusResponse} from "@/types/apis/repoTypes";

export interface UseRepositoryStatusProps {
  repositoryStatus: getRepositoryStatusResponse;
  setRepositoryStatus: (status: getRepositoryStatusResponse) => void;
}

export const useRepositoryStatusStore = create<UseRepositoryStatusProps>((set) => {

  return {
    repositoryStatus: {} as getRepositoryStatusResponse,
    setRepositoryStatus: (status: getRepositoryStatusResponse) => set({repositoryStatus: status}),
  }
})