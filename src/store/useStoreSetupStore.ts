import {create} from "zustand";
import {StorageType} from "@/types/StorageTypes";

export interface FileSystemConfig {
  path: string;
}

export interface GcsConfig {
  bucket: string;
  prefix?: string;
  credentialsFile?: string;
  credentials?: string;
}

export interface S3Config {
  doNotUseTLS: boolean;
  doNotVerifyTLS: boolean;
  bucket: string;
  endpoint: string;
  region?: string;
  accessKeyID: string;
  secretAccessKey: string;
  sessionToken?: string;
  prefix?: string;
}

export interface B2Config {
  bucket: string;
  keyId: string;
  key: string;
  prefix?: string;
}

export interface AzureBlobConfig {
  container: string;
  prefix?: string;
  storageAccount: string;
  storageKey?: string;
  storageDomain?: string;
  sasToken?: string;
}

export interface SftpConfig {
  port: number;
  validated: boolean;
  host: string;
  username: string;
  path: string;
  password?: string;
  keyfile?: string;
  knownHostsFile?: string;
  keyData?: string;
  knownHostsData?: string;
  externalSSH: boolean;
  sshCommand?: string;
  sshArguments?: string;
}

export interface RcloneConfig {
  remotePath: string;
  rcloneExe?: string;
}

export interface WebDavConfig {
  url: string;
  username?: string;
  password?: string;
}

export type StorageConfigType =
  | {type: StorageType.FILE_SYSTEM, config: FileSystemConfig}
  | {type: StorageType.GCS, config: GcsConfig}
  | {type: StorageType.S3, config: S3Config}
  | {type: StorageType.B2, config: B2Config}
  | {type: StorageType.AZURE_BLOB, config: AzureBlobConfig}
  | {type: StorageType.SFTP, config: SftpConfig}
  | {type: StorageType.RCLONE, config: RcloneConfig}
  | {type: StorageType.WEBDAV, config: WebDavConfig}

export interface StoreSetupOptionProps {
  blockFormat: {
    version: number;
    hash: string;
    encryption: string;
    ecc: string;
    eccOverheadPercent: number;
  },
  objectFormat: {
    splitter: string;
  }
}

export interface StoreSetupClientOptionsProps {
  description: string;
  username: string;
  hostname: string;
}

export interface StoreSetupStoreProps {
  storage: StorageConfigType;
  setStorage: (storage: StorageConfigType) => void;
  clientOptions: StoreSetupClientOptionsProps;
  setClientOptions: (options: StoreSetupClientOptionsProps) => void;
}

export const useStoreSetupStore = create<StoreSetupStoreProps>((set) => {

  return {
    storage: {} as StorageConfigType,
    setStorage: (storage: StorageConfigType) => set({storage: storage}),
    clientOptions: { description: 'ONECloud', username: '', hostname: '' } as StoreSetupClientOptionsProps,
    setClientOptions: (options: StoreSetupClientOptionsProps) => set({clientOptions: options}),
  }
});