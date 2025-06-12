import React from 'react'
import {Box, Input, Stack} from "@mui/joy";
import FormField from "../../common/FormField";
import {useFormContext} from "react-hook-form";
import {AzureBlobConfig} from "@/store/useStoreSetupStore";
const SetupRepositoryAzure = () => {

  const {control, formState: {errors}} = useFormContext<AzureBlobConfig>()

  return (
    <Box>
      <Stack gap={3}>
        <Stack gap={2} flexDirection={'row'} sx={{width: '100%'}}>
          <FormField
            name={'container'}
            control={control}
            label={'Container'}
            rules={{ required: true }}
            error={!!errors.container}
            sx={{
              display: 'flex',
              flex: 1
            }}
          >
            {(field) => (
              <Input {...field} placeholder={'컨테이너 이름을 입력해주세요.'} />
            )}
          </FormField>
          <FormField
            name={'storageAccount'}
            control={control}
            label={'Storage Account'}
            rules={{ required: true }}
            error={!!errors.storageAccount}
            sx={{
              display: 'flex',
              flex: 1
            }}
          >
            {(field) => (
              <Input {...field} placeholder={'스토리지 계정 이름을 입력해주세요.'} />
            )}
          </FormField>
        </Stack>

        <Stack gap={2} flexDirection={'row'} sx={{width: '100%'}}>
          <FormField
            name={'storageDomain'}
            control={control}
            label={'Azure Storage Domain'}
            sx={{
              display: 'flex',
              flex: 1
            }}
          >
            {(field) => (
              <Input {...field} placeholder={"스토리지 도메인을 입력하거나 기본값인 'blob.core.windows.net'을 위해 비워두세요."} />
            )}
          </FormField>
          <FormField
            name={'prefix'}
            control={control}
            label={'Object Name Prefix'}
            sx={{
              display: 'flex',
              flex: 1
            }}
          >
            {(field) => (
              <Input {...field} placeholder={'object name prefix를 입력하거나 비워두세요.'} />
            )}
          </FormField>
        </Stack>

        <Stack gap={2} flexDirection={'row'} sx={{width: '100%'}}>
          <FormField
            name={'storageKey'}
            control={control}
            label={'Access Key'}
            sx={{
              display: 'flex',
              flex: 1
            }}
          >
            {(field) => (
              <Input {...field} placeholder={'시크릿 엑세스 키를 입력해주세요.'} type={'password'} />
            )}
          </FormField>
          <FormField
            name={'sasToken'}
            control={control}
            label={'SAS Token'}
            sx={{
              display: 'flex',
              flex: 1
            }}
          >
            {(field) => (
              <Input {...field} placeholder={'시크릿 SAS 토큰을 입력해주세요.'} type={'password'} />
            )}
          </FormField>
        </Stack>
      </Stack>
    </Box>
  )
}

export default SetupRepositoryAzure;