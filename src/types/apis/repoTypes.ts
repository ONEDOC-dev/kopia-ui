import {StorageConfigType, StoreSetupClientOptionsProps, StoreSetupOptionProps} from "@/store/useStoreSetupStore";

export interface getRepositoryStatusResponse {
  connected?: boolean;
  supportsContentCompression?: boolean;
  hostname?: string;
  username?: string;
  enableActions?: boolean;
  configFile?: string;
  formatVersion?: string;
  hash?: string;
  encryption?: string;
  splitter?: string;
  maxPackSize?: number;
  storage?: string;
  description?: string;
  formatBlobCacheDuration?: number;
  eccOverheadPercent?: number;
  ecc?: string
}

export interface algorithmProps {
  id: string;
  deprecated: boolean;
}

export interface getAlgorithmsResponse {
  defaultHash: string;
  defaultEncryption: string;
  defaultEcc: string;
  defaultSplitter: string;
  hash: algorithmProps[];
  encryption: algorithmProps[];
  ecc: algorithmProps[];
  splitter: algorithmProps[];
}

export interface createRepositoryRequest {
  storage: StorageConfigType,
  password: string;
  options: StoreSetupOptionProps;
  clientOptions: StoreSetupClientOptionsProps;
}

export interface connectRepositoryRequest {
  storage: StorageConfigType;
  password: string;
  clientOptions: {
    description: string;
    hostname: string;
    username: string;
    readonly: boolean;
  }
}