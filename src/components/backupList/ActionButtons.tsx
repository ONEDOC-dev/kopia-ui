import {Button, Input, Sheet, Stack, Typography} from "@mui/joy";
import React, {useEffect, useState} from "react";
import {GridRenderCellParams} from "@mui/x-data-grid";
import useSource from "@/api/v1/useSource";
import {useRepositoryStatusStore} from "@/store/useRepositoryStatusStore";
import useTasks from "@/api/v1/useTasks";
import useSnapshot from "@/api/v1/useSnapshot";
import useRestore from "@/api/v1/useRestore";
import BaseModal from "@/components/common/BaseModal";
import FormField from "@/components/common/FormField";
import {useForm} from "react-hook-form";
import {
  BackupListSettingActions,
  BackupListSettingContent,
  BackupListSettingProps
} from "@/components/backupList/AddList";
import dayjs from "dayjs";
import usePolicy from "@/api/v1/usePolicy";
import {useAlert} from "@/contexts/ContextAlert";
import { FolderOpen } from "@mui/icons-material";

interface ActionButtonCommonProps {
  userName: string;
  host: string;
  path: string;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const BackupButton = ({
  userName,
  host,
  path,
  isLoading,
  setIsLoading,
}: ActionButtonCommonProps) => {
  const {uploadSource, getSources} = useSource();
  const [cashedBytes, setCashedBytes] = useState<number>(0);
  const [hashedBytes, setHashedBytes] = useState<number>(0);
  const [estimatedBytes, setEstimatedBytes] = useState<number>(0);

  const backupNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    await uploadSource({
      userName: userName,
      host: host,
      path: path,
    })
      .then(() => {
        checkBackupStatus(path);
      })
      .catch(err => {
        console.log(err);
        setIsLoading(false);
      });
  }

  const checkBackupStatus = async (uploadPath: string) => {
    await getSources()
      .then(res => {
        const backupStatus = res.sources.find(item => item.source.path === uploadPath);
        if (backupStatus && backupStatus.upload){
          setCashedBytes(backupStatus.upload.cachedBytes);
          setHashedBytes(backupStatus.upload.hashedBytes);
          if (estimatedBytes === 0) setEstimatedBytes(backupStatus.upload.estimatedBytes);
          setTimeout(() => checkBackupStatus(uploadPath), 1000);
        } else {
          setIsLoading(false);
        }
      });
  }

  return (
    <>
      <Button
        variant={'outlined'}
        sx={{width: '100px', color: '#3D76FE', borderColor: '#3D76FE'}}
        onClick={backupNow}
        loading={isLoading}
        disabled={isLoading}
        loadingPosition={'start'}
      >
        {isLoading ? `${Math.round((cashedBytes + hashedBytes) / estimatedBytes) || 0}%` : '즉시 백업'}
      </Button>
    </>
  )
}

const RestoreButton = ({
                         userName,
                         host,
                         path,
                         isLoading,
                         setIsLoading,
                       }: ActionButtonCommonProps) => {
  const {getSnapshot} = useSnapshot();
  const {restore} = useRestore();
  const {getTasksById} = useTasks();
  const [open, setOpen] = useState<boolean>(false);
  const {addAlert} = useAlert();

  const {control, formState: {errors}, handleSubmit, getValues, setValue} = useForm({
    mode: 'onBlur',
    defaultValues: {
      restoreDir: ''
    }
  });

  const handleRestore = async () => {
    setIsLoading(true);
    await getSnapshot({
      userName: userName,
      host: host,
      path: path,
    })
      .then(async (res) => {
        if (res.snapshots.length > 0) {
          await restore({
            root: res.snapshots[0].id,
            options: {
              incremental: true,
              ignoreErrors: false,
              restoreDirEntryAtDepth: 1000,
              minSizeForPlaceholder: 0
            },
            fsOutput: {
              targetPath: getValues('restoreDir'),
              skipOwners: false,
              skipPermissions: false,
              skipTimes: false,
              ignorePermissionErrors: true,
              overwriteFiles: false,
              overwriteDirectories: false,
              overwriteSymlinks: false,
              writeFilesAtomically: false,
              writeSparseFiles: false
            }
          })
            .then(async (res) => {
              await getTasksById(res.id)
                .then((res) => {
                  if (res.errorMessage) {
                    addAlert({
                      message: `${res.errorMessage}`,
                      color: 'danger',
                    });
                  } else {
                    setOpen(false)
                    addAlert({
                      message: `복구가 완료되었습니다.`,
                      color: 'success',
                    });
                  }
                })
                .catch(err => {
                  console.log(err)
                  addAlert({
                    message: err.message,
                    color: 'danger',
                  });
                })
            })
            .catch((err) => {
              console.log(err);
              addAlert({
                message: err.message,
                color: 'danger',
              });
            })
        }
      })
      .catch(err => {
        console.log(err);
        addAlert({
          message: err.message,
          color: 'danger',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    setValue('restoreDir', '');
  }, [open]);

  const onDirectorySelect = async () => {
    try {
      setIsLoading(true);
      const selectedPath = await window.electron.selectDirectory();
      if (selectedPath) {
        setValue('restoreDir', selectedPath);
      }
    } catch (error) {
      addAlert({
        message: `디렉토리 선택 오류: ${error}}`,
        color: 'danger',
      });
    }
    setIsLoading(false);
  }

  const RestoreButtonContent = () => (
    <Sheet>
      <form id={'restore-form'} onSubmit={handleSubmit(handleRestore)}>
        <FormField
          name={'restoreDir'}
          control={control}
          label={'복구 경로'}
          rules={{ required: true }}
          error={!!errors.restoreDir}
        >
          {(field) => (
            <Input 
              {...field} 
              placeholder={'복구할 경로를 선택해주세요'} 
              {...(window.electron && {
                endDecorator: (
                  <Button
                    variant="solid"
                    color="primary"
                    sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                    onClick={onDirectorySelect}
                    loading={isLoading}
                  >
                    <FolderOpen />
                  </Button>
                )
              })}
            />
          )}
        </FormField>
      </form>
    </Sheet>
  )

  const RestoreButtonAction = () => (
    <>
      <Button sx={{width: '150px'}} variant={'outlined'} color={'neutral'} onClick={() => setOpen(false)}>취소</Button>
      <Button sx={{width: '150px'}} variant={'solid'} type={'submit'} form={'restore-form'}>복구</Button>
    </>
  )

  return (
    <>
      <Button
        variant={'outlined'}
        sx={{width: '100px', color: '#3D76FE', borderColor: '#3D76FE'}}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        loading={isLoading}
      >
        복구하기
      </Button>
      <BaseModal
        open={open}
        setOpen={setOpen}
        title={'복구하기'}
        content={<RestoreButtonContent />}
        actions={<RestoreButtonAction />}
      />
    </>
  )
}

interface SettingButton extends ActionButtonCommonProps {
  backupTime: string[];
  onFresh: () => void;
}

const SettingButton = ({
  userName,
  host,
  path,
  isLoading,
  setIsLoading,
  backupTime,
  onFresh
}: SettingButton) => {
  const {updatePolicy} = usePolicy();
  const [open, setOpen] = useState<boolean>(false);
  const {addAlert} = useAlert();

  const modifySetting = async (data: BackupListSettingProps) => {
    setIsLoading(true);
    await updatePolicy({
      params: {
        userName: userName,
        host: host,
        path: path,
      },
      body: {
        scheduling: {
          timeOfDay: [
            {hour: data.firstBackupPeriod!.get('hour'), min: data.firstBackupPeriod!.get('minute')},
            {hour: data.secondBackupPeriod!.get('hour'), min: data.secondBackupPeriod!.get('minute')},
          ]
        }
      }
    })
      .then(res => {
        addAlert({
          message: '백업 리스트 설정이 변경되었습니다',
          color: 'success'
        });
        setOpen(false);
        onFresh();
      })
      .catch(err => {
        console.log(err);
        addAlert({
          message: err.message,
          color: 'success'
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <>
      <Button
        variant={'outlined'}
        sx={{width: '100px', color: '#3D76FE', borderColor: '#3D76FE'}}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        loading={isLoading}
      >
        설정변경
      </Button>
      <BaseModal open={open} setOpen={setOpen} title={'백업 리스트 설정'}
                 content={<BackupListSettingContent backupDirDisabled={true} onHandleSubmit={modifySetting} initValues={{
                  backupDir: path,
                  firstBackupPeriod: dayjs(backupTime[0], 'HH:mm'),
                  secondBackupPeriod: dayjs(backupTime[1], 'HH:mm'),
                }} />}
                 actions={<BackupListSettingActions />}
                 modalSx={{width: '600px'}}
      />
    </>
  )
}

export interface ActionButtonsProps {
  params: GridRenderCellParams;
  onFresh: () => void;
}

const ActionButtons = ({params, onFresh}: ActionButtonsProps) => {
  const {repositoryStatus} = useRepositoryStatusStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <Stack
      flexDirection={'row'}
      gap={1}
      alignItems={'center'}
      justifyContent={'center'}
      sx={{height: '100%'}}
    >
      <SettingButton
        userName={repositoryStatus.username!}
        host={repositoryStatus.hostname!}
        path={params.id as string}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        backupTime={params.row.backupTime}
        onFresh={onFresh}
      />
      <BackupButton
        userName={repositoryStatus.username!}
        host={repositoryStatus.hostname!}
        path={params.id as string}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      <RestoreButton
        userName={repositoryStatus.username!}
        host={repositoryStatus.hostname!}
        path={params.id as string}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </Stack>
  )
}

export default ActionButtons;