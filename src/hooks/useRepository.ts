import {StorageType} from "@/types/StorageTypes";
import {
  AzureBlobConfig,
  B2Config,
  FileSystemConfig,
  GcsConfig,
  RcloneConfig,
  S3Config,
  SftpConfig, WebDavConfig
} from "@/store/useStoreSetupStore";
import {useRepositoryStatusStore} from "@/store/useRepositoryStatusStore";
import useRepoApi from "@/api/v1/useRepoApi";
import {useNavigate} from "react-router-dom";
import {useAlert} from "@/contexts/ContextAlert";

export type StorageConfigMap = {
  [StorageType.FILE_SYSTEM]: FileSystemConfig;
  [StorageType.GCS]: GcsConfig;
  [StorageType.S3]: S3Config;
  [StorageType.B2]: B2Config;
  [StorageType.AZURE_BLOB]: AzureBlobConfig;
  [StorageType.SFTP]: SftpConfig;
  [StorageType.RCLONE]: RcloneConfig;
  [StorageType.WEBDAV]: WebDavConfig;
};

export const useRepository = () => {
  const {getRepositoryStatus} = useRepoApi();
  const {setRepositoryStatus} = useRepositoryStatusStore();
  const navigate = useNavigate();
  const {addAlert} = useAlert();

  const getDefaultValues = <T extends StorageType>(provider: T): StorageConfigMap[T] => {
    const defaultValues = {
      [StorageType.FILE_SYSTEM]: {
        path: ''
      },
      [StorageType.GCS]: {
        bucket: '',
        prefix: '',
        credentialsFile: '',
        credentials: '',
      },
      [StorageType.S3]: {
        doNotUseTLS: false,
        doNotVerifyTLS: false,
        bucket: '',
        endpoint: '',
        region: '',
        accessKeyID: '',
        secretAccessKey: '',
        sessionToken: '',
        prefix: '',
      },
      [StorageType.B2]: {
        bucket: '',
        keyId: '',
        key: '',
        prefix: '',
      },
      [StorageType.AZURE_BLOB]: {
        container: '',
        prefix: '',
        storageAccount: '',
        storageKey: '',
        storageDomain: '',
        sasToken: '',
      },
      [StorageType.SFTP]: {
        port: 22,
        validated: false,
        host: '',
        username: '',
        path: '',
        password: '',
        keyfile: '',
        knownHostsFile: '',
        keyData: '',
        knownHostsData: '',
        externalSSH: false,
        sshCommand: '',
        sshArguments: '',
      },
      [StorageType.RCLONE]: {
        remotePath: '',
        rcloneExe: '',
      },
      [StorageType.WEBDAV]: {
        url: '',
        username: '',
        password: '',
      },
    }
    return defaultValues[provider]
  }

  const updateRepositoryConnected = async () => {
    const res = await getRepositoryStatus();
    if (res) {
      setRepositoryStatus(res);
      if (res.connected){
        addAlert({
          message: '저장소 연결에 성공했습니다.',
          color: 'success'
        });
        navigate('/repositoryManage');
      } else {
        addAlert({
          message: '저장소와 연결되어 있지 않습니다.',
          color: 'warning'
        });
        navigate('/setupRepository');
      }
    }
  }

  return {
    getDefaultValues,
    updateRepositoryConnected
  }
}