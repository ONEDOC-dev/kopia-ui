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
  const {addAlert} = useAlert();
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
      addAlert({
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
                rules={{ required: true }}
                error={!!errors.firstBackupPeriod}
              >
                {(field) => (
                  <TimePicker views={['hours', 'minutes']} ampm={false} {...field} sx={{height: '42px'}} />
                )}
              </FormField>

              <FormField
                name={'secondBackupPeriod'}
                control={control}
                label={'두 번째 타임'}
                rules={{ required: true, validate: (value) => value === getValues('firstBackupPeriod') || true }}
                error={!!errors.secondBackupPeriod}
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
  const {addAlert} = useAlert();

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

        setSource(request)
          .then(res => {
            if (res.snapshotted){
              addAlert({
                message: '백업 리스트가 추가되었습니다.',
                color: 'success',
              });
              setTimeout(() => onAdd(), 300);
              setOpen(false);
            }
          })
          .catch((e) => {
            addAlert({
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
          navigate("/repositoryManage");
        } else {
          addAlert({
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