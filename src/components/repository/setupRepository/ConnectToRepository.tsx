import React, {useState} from 'react';
import {Button, IconButton, Input, Stack, Typography, Checkbox} from "@mui/joy";
import FormField from "@/components/common/FormField";
import {useFormContext} from "react-hook-form";
import {KeyboardDoubleArrowDown, KeyboardDoubleArrowUp, Visibility} from "@mui/icons-material";

export interface ConnectToRepositoryConfig {
  password: string;
  clientOptions: {
    description: string;
    hostname: string;
    username: string;
    readonly: boolean;
  }
}

const ConnectToRepository = () => {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const {control, formState: {errors}, getValues} = useFormContext<ConnectToRepositoryConfig>();

  return (
    <Stack gap={5}>
      <Stack>
        <Typography level={'h3'}>저장소 연결</Typography>
      </Stack>

      <Stack gap={2}>
        <FormField
          name={'password'}
          control={control}
          label={'SetupRepository Password'}
          rules={{ required: true }}
          error={!!errors.password}
          sx={{
            display: 'flex',
            flex: 1
          }}
        >
          {(field) => (
            <Input
              {...field}
              placeholder={'저장소 비밀번호를 입력해주세요.'}
              type={showPassword ? 'text' : 'password'}
              endDecorator={
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  <Visibility />
                </IconButton>
              }
            />
          )}
        </FormField>

        <FormField
          name={'clientOptions.description'}
          control={control}
          label={'SetupRepository Description'}
          rules={{ required: true }}
          error={!!errors.clientOptions?.description}
          sx={{
            display: 'flex',
            flex: 1
          }}
        >
          {(field) => (
            <Input
              {...field}
              placeholder={'저장소 설명을 입력해주세요.'}
            />
          )}
        </FormField>

        <Button sx={{width: '250px'}} onClick={() => setShowAdvancedOptions(!showAdvancedOptions)} startDecorator={showAdvancedOptions ? <KeyboardDoubleArrowUp /> : <KeyboardDoubleArrowDown />}>Show Advanced Options</Button>

        {showAdvancedOptions &&
          <Stack>
            <FormField
              name={'clientOptions.readonly'}
              control={control}
              label={''}
              sx={{
                display: 'flex',
                flex: 1
              }}
            >
              {(field) => (
                <Checkbox {...field} label={'Connect in read-only mode'} variant={'soft'} />
              )}
            </FormField>
            <Stack gap={2} flexDirection={'row'} sx={{width: '100%'}}>
              <FormField
                name={'clientOptions.username'}
                control={control}
                label={'Username'}
                rules={{ required: true }}
                error={!!errors.clientOptions?.username}
                sx={{
                  display: 'flex',
                  flex: 1
                }}
              >
                {(field) => (
                  <Input
                    {...field}
                    placeholder={'Username을 입력해주세요'}
                    value={getValues('clientOptions.username')}
                  />
                )}
              </FormField>
              <FormField
                name={'clientOptions.hostname'}
                control={control}
                label={'Hostname'}
                rules={{ required: true }}
                error={!!errors.clientOptions?.hostname}
                sx={{
                  display: 'flex',
                  flex: 1
                }}
              >
                {(field) => (
                  <Input
                    {...field}
                    placeholder={'Username을 입력해주세요'}
                    value={getValues('clientOptions.hostname')}
                  />
                )}
              </FormField>
            </Stack>
          </Stack>
        }
      </Stack>
    </Stack>
  )
}

export default ConnectToRepository;