import React from 'react';
import {useFormContext} from "react-hook-form";
import {S3Config} from "@/store/useStoreSetupStore";
import {Box, Input, Stack} from "@mui/joy";
import FormField from "@/components/common/FormField";

const SetupRepositoryS3 = () => {

  const {control, formState: {errors}} = useFormContext<S3Config>();

  return (
    <Box>
      <Stack gap={3}>
        <Stack gap={2} flexDirection={'row'} sx={{width: '100%'}}>
          <FormField
            name={'bucket'}
            control={control}
            label={'Bucket'}
            rules={{ required: true }}
            error={!!errors.bucket}
            sx={{
              display: 'flex',
              flex: 1
            }}
          >
            {(field) => (
              <Input {...field} placeholder={'버킷 이름을 입력해주세요.'} />
            )}
          </FormField>

          <FormField
            name={'endpoint'}
            control={control}
            label={'Endpoint'}
            rules={{ required: true }}
            error={!!errors.endpoint}
            sx={{
              display: 'flex',
              flex: 1
            }}
          >
            {(field) => (
              <Input {...field} placeholder={'엔드 포인트를 입력해주세요.'} />
            )}
          </FormField>
        </Stack>

        <Stack gap={2} flexDirection={'row'} sx={{width: '100%'}}>
          <FormField
            name={'accessKeyID'}
            control={control}
            label={'Access Key ID'}
            rules={{ required: true }}
            error={!!errors.accessKeyID}
            sx={{
              display: 'flex',
              flex: 1
            }}
          >
            {(field) => (
              <Input {...field} placeholder={'Access Key ID를 입력해주세요.'} />
            )}
          </FormField>

          <FormField
            name={'secretAccessKey'}
            control={control}
            label={'Secret Access Key'}
            rules={{ required: true }}
            error={!!errors.secretAccessKey}
            sx={{
              display: 'flex',
              flex: 1
            }}
          >
            {(field) => (
              <Input {...field} placeholder={'Secret Access Key를 입력해주세요.'} type={'password'} />
            )}
          </FormField>
        </Stack>

        <Stack gap={2} flexDirection={'row'} sx={{width: '100%'}}>
          <FormField
            name={'region'}
            control={control}
            label={'Override Region'}
            sx={{
              display: 'flex',
              flex: 1
            }}
          >
            {(field) => (
              <Input {...field} placeholder={"특정 Region을 입력해주세요. (예, 'us-west-1')를 입력하거나 비워두세요."} />
            )}
          </FormField>

          <FormField
            name={'sessionToken'}
            control={control}
            label={'Session Token'}
            sx={{
              display: 'flex',
              flex: 1
            }}
          >
            {(field) => (
              <Input {...field} placeholder={'세션 토큰을 입력하거나 비워두세요.'} type={'password'} />
            )}
          </FormField>
        </Stack>
      </Stack>
    </Box>
  )
}

export default SetupRepositoryS3;