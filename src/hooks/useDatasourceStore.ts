import {create} from "zustand";
import {persist} from 'zustand/middleware';

interface DatasourceState {
  realm: string;
  setRealm: (aet: string) => void;
  getRealm: () => string;
}

export const useDatasourceStore = create(
  persist<DatasourceState>(
    (set, get) => ({
      realm: 'one_cloud',
      setRealm: (realm: string) => set({realm: realm}),
      getRealm: () => { return get().realm },
    }),
    {
      name: "OneCloudDatasourceStore"
    }
  )
);
