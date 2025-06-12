import React, {useEffect, useState} from 'react'
import SetupRepositoryAzure from "@/components/repository/setupRepository/SetupRepositoryAzure";
import {Box, Button, Option, Select, Stack, Typography} from "@mui/joy";
import {FormProvider, useForm} from "react-hook-form";
import {StorageType} from '@/types/StorageTypes'
import {StorageConfigMap, useRepository} from "@/hooks/useRepository";
import {
  AzureBlobConfig,
  B2Config,
  FileSystemConfig,
  GcsConfig,
  RcloneConfig,
  S3Config,
  SftpConfig, StorageConfigType, useStoreSetupStore, WebDavConfig
} from "@/store/useStoreSetupStore";
import useRepoApi from "@/api/v1/useRepoApi";
import CreateNewRepository, {CreateNewRepositoryConfig} from "@/components/repository/CreateNewRepository";
import ConnectToRepository, {
  ConnectToRepositoryConfig
} from "@/components/repository/setupRepository/ConnectToRepository";
import useCurrentUser from "@/api/v1/useCurrentUser";
import {useAlert} from "@/contexts/ContextAlert";
import SetupRepositoryS3 from "@/components/repository/setupRepository/SetupRepositoryS3";

const SetupRepository = () => {
  const [selectedType, setSelectedType] = useState<number>(0);
  const {getDefaultValues, updateRepositoryConnected} = useRepository();
  const {getCurrentUser} = useCurrentUser();
  const {storage, setStorage, clientOptions, setClientOptions} = useStoreSetupStore();
  const supportedProviders: {
    provider: StorageType;
    description: string;
    component: React.ReactNode;
  }[] = [
    // {
    //   provider: StorageType.FILE_SYSTEM,
    //   description: "Local Directory or NAS",
    //   component: SetupRepositoryFilesystem,
    // },
    // {
    //   provider: StorageType.GCS,
    //   description: "Google Cloud Storage",
    //   component: SetupRepositoryGCS,
    // },
    {
      provider: StorageType.S3,
      description: "Amazon S3 or Compatible Storage",
      component: <SetupRepositoryS3 />,
    },
    // {
    //   provider: StorageType.B2,
    //   description: "Backblaze B2",
    //   component: SetupRepositoryB2
    // },
    {
      provider: StorageType.AZURE_BLOB,
      description: "Azure Blob Storage",
      component: <SetupRepositoryAzure />,
    },
    // {
    //   provider: StorageType.SFTP,
    //   description: "SFTP Server",
    //   component: SetupRepositorySFTP,
    // },
    // {
    //   provider: StorageType.RCLONE,
    //   description: "Rclone Remote",
    //   component: SetupRepositoryRclone,
    // },
    // {
    //   provider: StorageType.WEBDAV,
    //   description: "WebDAV Server",
    //   component: SetupRepositoryWebDAV,
    // },
    // {
    //   provider: "_server",
    //   description: "Kopia SetupRepository Server",
    //   component: SetupRepositoryServer,
    // },
    // {
    //   provider: "_token",
    //   description: "Use SetupRepository Token",
    //   component: SetupRepositoryToken,
    // },
  ];
  const selectedProvider: StorageType = supportedProviders[selectedType].provider;
  const {repositoryExists, createRepository, connectToRepository} = useRepoApi();
  const [confirmCreate, setConfirmCreate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [storageVerified, setStorageVerified] = useState(false);
  const {addAlert} = useAlert();

  const storeConfigForm = useForm<StorageConfigMap[typeof selectedProvider]>({
    mode: 'onBlur',
    defaultValues: getDefaultValues(selectedProvider)
  });
  const createRepositoryForm = useForm({
    mode: 'onBlur',
    defaultValues: {
      password: '',
      options: {
        blockFormat: {
          version: 2,
          hash: '',
          encryption: '',
          ecc: '',
          eccOverheadPercent: '0'
        },
        objectFormat: {
          splitter: ''
        }
      },
      clientOptions: {
        username: clientOptions.username,
        hostname: clientOptions.hostname,
        description: clientOptions.description,
      }
    }
  });
  const connectRepositoryForm = useForm({
    mode: 'onBlur',
    defaultValues: {
      password: '',
      clientOptions: {
        description: clientOptions.description,
        hostname: clientOptions.hostname,
        username: clientOptions.username,
        readonly: false
      }
    }
  });

  useEffect(() => {
    getCurrentUser()
      .then(res => {
        setClientOptions({...clientOptions, hostname: res.hostname, username: res.username});
      });
  }, []);

  //
  const onSubmitVerified = async (data: FileSystemConfig | GcsConfig | S3Config | B2Config | AzureBlobConfig | SftpConfig | RcloneConfig | WebDavConfig) => {
    setIsLoading(true);

    await repositoryExists({
      storage: {
        type: selectedProvider,
        config: data
      }
    })
      .then((res) => {
        setStorageVerified(true);
        setConfirmCreate(false);
        setStorage({type: selectedProvider, config: data} as StorageConfigType);
      })
      .catch((error) => {
        if (error.response.data) {
          if (error.response.data.code === "NOT_INITIALIZED") {
            setConfirmCreate(true);
            setStorageVerified(true);
            setStorage({type: selectedProvider, config: data} as StorageConfigType);
          } else {
            addAlert({
              message: `${error.response.data.code}: ${error.response.data.error}`,
              color: 'danger'
            });
          }
        } else {
          addAlert({
            message: error.message,
            color: 'danger'
          });
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const onSubmitCreateRepository = async (data: CreateNewRepositoryConfig) => {
    setIsLoading(true);

    await createRepository({
      storage: storage,
      password: data.password,
      options: {
        ...data.options,
        blockFormat: {
          ...data.options.blockFormat,
          eccOverheadPercent: Number(data.options.blockFormat?.eccOverheadPercent),
        },
      },
      clientOptions: data.clientOptions,
    })
      .then(async (res) => {
        setClientOptions(data.clientOptions);
        await updateRepositoryConnected();
      })
      .catch((error) => {
        addAlert({
          message: `${error.response.data.code}: ${error.response.data.error}`,
          color: 'danger'
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const onSubmitConnect = async (data: ConnectToRepositoryConfig) => {
    setIsLoading(true);

    await connectToRepository({
      storage: storage,
      password: data.password,
      clientOptions: data.clientOptions,
    })
      .then(async () => {
        await updateRepositoryConnected();
      })
      .catch((error) => {
        setConfirmCreate(false);
        addAlert({
          message: `${error.response.data.code}: ${error.response.data.error}`,
          color: 'danger'
        })
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <Box sx={{overflowX: 'auto'}}>
      {!storageVerified &&
        <Stack gap={5}>
          <Stack gap={1}>
            <Typography level={'title-lg'}>저장소 유형 선택</Typography>
            <Select sx={{width: '300px'}} placeholder={'저장소 유형을 선택해주세요.'} value={selectedType}>
              {supportedProviders.map((item, index) => (
                <Option key={index} value={index} onClick={() => setSelectedType(index)}>
                  {item.description}
                </Option>
              ))}
            </Select>
          </Stack>
            <Stack gap={1}>
              <Typography level={'title-lg'}>저장소 구성</Typography>
              <FormProvider {...storeConfigForm}>
                <form onSubmit={storeConfigForm.handleSubmit(onSubmitVerified)} style={{display: 'flex', flexDirection: 'column', gap: 20}}>
                  {supportedProviders[selectedType].component}
                  <Stack flexDirection={'row-reverse'}>
                    <Button loading={isLoading} sx={{width: '150px'}} variant={'solid'} type={'submit'}>다음</Button>
                  </Stack>
                </form>
              </FormProvider>
            </Stack>
        </Stack>
      }
      {confirmCreate &&
        <FormProvider {...createRepositoryForm}>
          <form onSubmit={createRepositoryForm.handleSubmit(onSubmitCreateRepository)} style={{display: 'flex', flexDirection: 'column', gap: 20}}>
            <CreateNewRepository />
            <Stack flexDirection={'row-reverse'}>
              <Button loading={isLoading} sx={{width: '150px'}} variant={'solid'} type={'submit'}>저장소 생성</Button>
            </Stack>
          </form>
        </FormProvider>
      }
      {storageVerified && !confirmCreate &&
        <FormProvider {...connectRepositoryForm}>
          <form onSubmit={connectRepositoryForm.handleSubmit(onSubmitConnect)} style={{display: 'flex', flexDirection: 'column', gap: 20}}>
            <ConnectToRepository />
            <Stack flexDirection={'row-reverse'}>
              <Button loading={isLoading} sx={{width: '150px'}} variant={'solid'} type={'submit'}>저장소 연결</Button>
            </Stack>
          </form>
        </FormProvider>
      }
    </Box>
  )
}

export default SetupRepository;