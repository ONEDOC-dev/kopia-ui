import React, {useState} from 'react'
import {Box, Stack, Typography, Input, Button, Divider} from "@mui/joy";
import {useRepositoryStatusStore} from "@/store/useRepositoryStatusStore";
import FormField from "@/components/common/FormField";
import {useForm} from "react-hook-form";
import useRepoApi from "@/api/v1/useRepoApi";
import {useRepository} from "@/hooks/useRepository";
import {useAlert} from "@/contexts/ContextAlert";

const RepositoryManage = () => {
  const {getRepositoryStatus} = useRepoApi();
  const {repositoryStatus, setRepositoryStatus} = useRepositoryStatusStore();
  const {updateRepositoryConnected} = useRepository();
  const {updateDescription, disconnect} = useRepoApi();
  const [isLoading, setIsLoading] = useState(false)
  const {control, formState: {errors}, getValues} = useForm({
    mode: 'onBlur',
    defaultValues: {
      description: repositoryStatus.description,
    }
  })
  const {addAlert} = useAlert();

  const handleUpdateDescription = async () => {
    setIsLoading(true);
    await updateDescription(getValues('description')!)
      .then(async (res) => {
        const repoRes = await getRepositoryStatus();
        setRepositoryStatus(repoRes);
        if (repoRes.connected){
          addAlert({
            message: '저장소 설명이 변경되었습니다.',
            color: 'success'
          });
        } else {
          addAlert({
            message: `저장소 설명을 변경하는데 실패했습니다`,
            color: 'danger'
          });
        }
      })
      .catch(err => {
        addAlert({
          message: `${err.message}`,
          color: 'danger'
        });
      })
      .finally(() => {
        setIsLoading(false)
      });
  }

  const handleDisconnect = async () => {
    setIsLoading(true)
    await disconnect()
      .then(async (res) => {
        await updateRepositoryConnected()
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <Box sx={{overflowX: 'auto'}}>
      <Stack gap={2}>
        <Typography level="h4" component="div">{repositoryStatus.description}</Typography>
        <Stack>
          <FormField
            name={'description'}
            control={control}
            label={'Repository Description'}
            rules={{ required: true }}
            error={!!errors.description}
            sx={{
              display: 'flex',
              flex: 1
            }}
          >
            {(field) => (
              <Input {...field}
                     endDecorator={<Button loading={isLoading} onClick={handleUpdateDescription}>Update Description</Button>}
              />
            )}
          </FormField>
        </Stack>
        <Divider />
        <Stack gap={2}>
          <Stack>
            <Typography level={'title-md'}>Config File</Typography>
            <Input value={repositoryStatus.configFile} disabled />
          </Stack>

          <Stack gap={2} flexDirection={'row'}>
            <Stack flex={1}>
              <Typography level={'title-md'}>Provider</Typography>
              <Input value={repositoryStatus.storage} disabled />
            </Stack>
            <Stack flex={1}>
              <Typography level={'title-md'}>Encryption Algorithm</Typography>
              <Input value={repositoryStatus.encryption} disabled />
            </Stack>
            <Stack flex={1}>
              <Typography level={'title-md'}>Hash Algorithm</Typography>
              <Input value={repositoryStatus.hash} disabled />
            </Stack>
            <Stack flex={1}>
              <Typography level={'title-md'}>Splitter Algorithm</Typography>
              <Input value={repositoryStatus.splitter} disabled />
            </Stack>
          </Stack>

          <Stack gap={2} flexDirection={'row'}>
            <Stack flex={1}>
              <Typography level={'title-md'}>Repository Format</Typography>
              <Input value={repositoryStatus.formatVersion} disabled />
            </Stack>
            <Stack flex={1}>
              <Typography level={'title-md'}>Error Correction Overhead</Typography>
              <Input value={repositoryStatus.eccOverheadPercent && repositoryStatus.eccOverheadPercent > 0 ? `${repositoryStatus.eccOverheadPercent}%` : 'Disabled'} disabled />
            </Stack>
            <Stack flex={1}>
              <Typography level={'title-md'}>Error Correction Algorithm</Typography>
              <Input value={repositoryStatus.ecc || '-'} disabled />
            </Stack>
            <Stack flex={1}>
              <Typography level={'title-md'}>Internal Compression</Typography>
              <Input value={repositoryStatus.supportsContentCompression ? 'yes' : 'no'} disabled />
            </Stack>
          </Stack>

          <Stack>
            <Typography level={'title-md'}>Connected as</Typography>
            <Input value={`${repositoryStatus.username}@${repositoryStatus.hostname}`} disabled />
          </Stack>
        </Stack>
        <Stack flexDirection={'row-reverse'}>
          <Button color={'danger'} sx={{width: '200px'}} loading={isLoading} onClick={handleDisconnect}>Disconnect</Button>
        </Stack>
      </Stack>
    </Box>
  )
}

export default RepositoryManage;