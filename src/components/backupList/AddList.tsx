import React, {useState} from 'react'

import BaseModal from "../common/BaseModal";
import {Sheet, Stack, Typography, Input, Button} from "@mui/joy";
import {TimePicker} from "@mui/x-date-pickers";
import {Add, FolderOpen} from '@mui/icons-material';
import FormField from "../common/FormField";
import {useForm} from "react-hook-form";
import useSource from "@/api/v1/useSource";
import {useNavigate} from "react-router-dom";
import usePaths from "@/api/v1/usePaths";
import {Dayjs} from "dayjs";
import {useAlert} from "@/contexts/ContextAlert";

export interface BackupListSettingProps {
  backupDir: string;
  firstBackupPeriod: Dayjs | null;
  secondBackupPeriod: Dayjs | null;
}

interface BackupListSettingContentProps {
  initValues: BackupListSettingProps;
  onHandleSubmit: (data: BackupListSettingProps) => void;
  backupDirDisabled: boolean;
}

export const BackupListSettingContent = ({initValues, onHandleSubmit, backupDirDisabled}: BackupListSettingContentProps) => {
  const alertContext = useAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {control, formState: {errors}, handleSubmit, setValue, getValues} = useForm<BackupListSettingProps>({
    mode: 'onBlur',
    defaultValues: initValues
  });

  const onDirectorySelect = async () => {
    try {
      setIsLoading(true);
      const selectedPath = await window.electron.selectDirectory();
      if (selectedPath) {
        setValue('backupDir', selectedPath);
      }
    } catch (error) {
      alertContext?.addAlert({
        message: `디렉토리 선택 오류: ${error}}`,
        color: 'danger',
      });
    }
    setIsLoading(false);
  }

  return (
    <Sheet sx={{py: 2}}>
      <Stack gap={4}>
        <form id={'add-list-form'} onSubmit={handleSubmit(onHandleSubmit)}>
          <FormField
            name={'backupDir'}
            control={control}
            label={'백업 경로 (원본)'}
            rules={{ required: true }}
            error={!!errors.backupDir}
          >
            {(field) => (
              <>
                <Typography color={'danger'} level={'body-sm'} >*해당 경로에 있는 자료들이 백업 됩니다.</Typography>
                <Input disabled={backupDirDisabled}
                       {...(!backupDirDisabled && window.electron && {
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
                       {...field}
                       placeholder={'백업할 경로를 입력해주세요.'}
                />
              </>
            )}
          </FormField>

          <Stack gap={.5}>
            <Typography fontWeight={'bold'}>백업 시간 설정</Typography>
            <Typography color={'danger'} level={'body-sm'} >*하루 두 번 백업이 자동으로 진행됩니다. 첫 번째와 두 번째 백업 시간을 지정해 주세요.</Typography>
            <Stack gap={3} flexDirection={'row'}>
              <FormField
                name={'firstBackupPeriod'}
                control={control}
                label={'첫 번째 타임'}
                rules={{ 
                  required: '백업 시간을 설정해 주세요',
                  validate: (value) => {
                    const secondBackupPeriod = getValues('secondBackupPeriod');
                    if (value && secondBackupPeriod && 
                        typeof value === 'object' && 'get' in value &&
                        typeof secondBackupPeriod === 'object' && 'get' in secondBackupPeriod &&
                        value.get('hour') === secondBackupPeriod.get('hour')) {
                      return "첫 번째와 두 번째 백업 '시(hour)'가 같을 수 없습니다.";
                    }
                    return true;
                  }
                }}
                error={!!errors.firstBackupPeriod}
                helperText={errors.firstBackupPeriod?.message}
              >
                {(field) => (
                  <TimePicker views={['hours', 'minutes']} ampm={false} {...field} />
                )}
              </FormField>

              <FormField
                name={'secondBackupPeriod'}
                control={control}
                label={'두 번째 타임'}
                rules={{ 
                  required: '백업 시간을 설정해 주세요',
                  validate: (value) => {
                    const firstBackupPeriod = getValues('firstBackupPeriod');
                    if (value && firstBackupPeriod && 
                        typeof value === 'object' && 'get' in value &&
                        typeof firstBackupPeriod === 'object' && 'get' in firstBackupPeriod &&
                        value.get('hour') === firstBackupPeriod.get('hour')) {
                      return "첫 번째와 두 번째 백업 '시(hour)'가 같을 수 없습니다.";
                    }
                    return true;
                  }
                }}
                error={!!errors.secondBackupPeriod}
                helperText={errors.secondBackupPeriod?.message}
              >
                {(field) => (
                  <TimePicker views={['hours', 'minutes']} ampm={false} {...field} />
                )}
              </FormField>
            </Stack>
          </Stack>
        </form>
      </Stack>
    </Sheet>
  )
}

export const BackupListSettingActions = ({setOpen}: {setOpen: React.Dispatch<React.SetStateAction<boolean>>}) => {

  return (
    <>
      <Button sx={{width: '150px'}} variant={'outlined'} color={'neutral'} onClick={() => setOpen(false)}>취소</Button>
      <Button sx={{width: '150px'}} variant={'solid'} type={'submit'} form={'add-list-form'}>저장</Button>
    </>
  )
}

interface AddListProps {
  onAdd: () => void;
}

const AddList = ({onAdd}: AddListProps) => {
  const [open, setOpen] = useState(false);
  const {setSource} = useSource();
  const {pathsResolve} = usePaths();
  const navigate = useNavigate();
  const alertContext = useAlert();

  const snapshotNow = (data: BackupListSettingProps) => {

    pathsResolve({path: data.backupDir})
      .then(() => {
        const request = {
          path: data.backupDir,
          createSnapshot: true,
          policy: {
            scheduling: {
              timeOfDay: [
                {hour: data.firstBackupPeriod!.get('hour'), minute: data.firstBackupPeriod!.get('minute')},
                {hour: data.secondBackupPeriod!.get('hour'), minute: data.secondBackupPeriod!.get('minute')},
              ]
            }
          }
        }
        console.log(request);
        setSource(request)
          .then(res => {
            if (res.snapshotted){
              alertContext?.addAlert({
                message: '백업 리스트가 추가되었습니다.',
                color: 'success',
              });
              setTimeout(() => onAdd(), 300);
              setOpen(false);
            }
          })
          .catch((e) => {
            alertContext?.addAlert({
              message: e.message,
              color: 'danger',
            });
          })
      })
      .catch(e => {
        if (
          e &&
          e.response &&
          e.response.data &&
          e.response.data.code === "NOT_CONNECTED"
        ) {
          alertContext?.addAlert({
            message: '저장소가 등록되어 있지 않습니다. 관리자에게 문의해주세요.',
            color: 'danger',
          });
        } else {
          alertContext?.addAlert({
            message: e.message,
            color: 'danger',
          });
        }
      });
  }

  return (
    <>
      <Button
        startDecorator={<Add />}
        sx={{
          background: 'linear-gradient(to right, #1755E3, #4D7DFB, #29B6FF)'
        }}
        onClick={() => setOpen(!open)}
      >
        리스트 추가
      </Button>
      <BaseModal open={open} setOpen={setOpen} title={'백업 리스트 추가'}
                 content={
                    <BackupListSettingContent onHandleSubmit={snapshotNow} initValues={{
                       backupDir: '',
                       firstBackupPeriod: null,
                       secondBackupPeriod: null,
                     }}
                      backupDirDisabled={false}
                    />
                 }
                 actions={<BackupListSettingActions setOpen={setOpen} />}
                 modalSx={{width: '600px'}}
      />
    </>
  )
}

export default AddList