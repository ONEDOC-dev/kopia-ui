import React, {useEffect, useState} from 'react';
import {Button, Input, Select, Stack, Typography, Option, IconButton} from "@mui/joy";
import FormField from "@/components/common/FormField";
import {useFormContext} from "react-hook-form";
import {StoreSetupClientOptionsProps, StoreSetupOptionProps} from "@/store/useStoreSetupStore";
import useRepoApi from "@/api/v1/useRepoApi";
import {KeyboardDoubleArrowDown, KeyboardDoubleArrowUp, Visibility} from '@mui/icons-material';
import {algorithmProps, getAlgorithmsResponse} from "@/types/apis/repoTypes";

export interface CreateNewRepositoryConfig {
  password: string;
  passwordCheck: string;
  options: StoreSetupOptionProps;
  clientOptions: StoreSetupClientOptionsProps;
}

const CreateRepository = () => {
  const {getAlgorithms} = useRepoApi();
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);

  const [algorithms, setAlgorithms] = useState<getAlgorithmsResponse>({} as getAlgorithmsResponse)
  const [formatVersion, setFormatVersion] = useState<string>('2');

  const {control, formState: {errors}, trigger, getValues, setValue} = useFormContext<CreateNewRepositoryConfig>();


  useEffect(() => {
    getAlgorithms()
      .then(res => {
        setAlgorithms(res);
        setValue('options.blockFormat.hash', res.defaultHash);
        setValue('options.blockFormat.encryption', res.defaultEncryption);
        setValue('options.blockFormat.ecc', res.defaultEcc);
        setValue('options.objectFormat.splitter', res.defaultSplitter);
        setValue('options.blockFormat.eccOverheadPercent', 0);
      });



  }, []);

  const createOptions = (type: algorithmProps[], defaultValue: string) => (
    type.map(x => {
      return (
        <Option key={x.id} value={x.id}>
          {`${x.id} ${x.id === defaultValue ? ' (RECOMMENDED)' : ''} ${x.deprecated ? ' (NOT RECOMMENDED)' : ''}`}
        </Option>
      )
    })
  )

  return (
    <Stack gap={5}>
      <Stack>
        <Typography level={'h3'}>새 저장소 생성</Typography>
        <Typography>저장소를 만들려면 강력한 비밀번호를 입력하세요.</Typography>
      </Stack>

      <Stack>
        <Typography level={'title-lg'}>저장소 비밀번호</Typography>
        <Stack gap={2} flexDirection={'row'} sx={{width: '100%'}}>
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
                type={'password'}
                endDecorator={
                  <IconButton>
                    <Visibility />
                  </IconButton>
                }
              />
            )}
          </FormField>
          <FormField name={'passwordCheck'}
                     control={control}
                     label={'Confirm SetupRepository Password'}
                     rules={{
                       required: true,
                       validate: {
                         matchPassword: (value) => {
                           const { password } = getValues();
                           return password === value || '비밀번호가 일치하지 않습니다.';
                         }
                       }
                     }}
                     error={!!errors.passwordCheck}
                     sx={{
                       display: 'flex',
                       flex: 1
                     }}
          >
            {(field) => (
              <Input {...field} placeholder={'저장소 비밀번호를 다시 입력해주세요.'} type={'password'} />
            )}
          </FormField>
        </Stack>
      </Stack>

      <Button sx={{width: '250px'}} onClick={() => setShowAdvancedOptions(!showAdvancedOptions)} startDecorator={showAdvancedOptions ? <KeyboardDoubleArrowUp /> : <KeyboardDoubleArrowDown />}>Show Advanced Options</Button>

      {showAdvancedOptions &&
        <Stack gap={2}>
          <Stack gap={2} flexDirection={'row'} sx={{width: '100%'}}>
            <FormField
              name={'options.blockFormat.encryption'}
              control={control}
              label={'Encryption'}
              sx={{
                display: 'flex',
                flex: 1
              }}>
              {(field) => (
                <Select {...field} value={getValues('options.blockFormat.encryption')} onChange={(_, value) => {
                  if (value) {
                    console.log(value)
                    field.onChange(value);
                    trigger('options.blockFormat.encryption');
                  }
                }}>
                  {createOptions(algorithms.encryption as algorithmProps[], getValues('options.blockFormat.encryption'))}
                </Select>
              )}
            </FormField>
            <FormField
              name={'options.blockFormat.hash'}
              control={control}
              label={'Hash Algorithm'}
              sx={{
                display: 'flex',
                flex: 1
              }}>
              {(field) => (
                <Select {...field} value={getValues('options.blockFormat.hash')} onChange={(_, value) => {
                  if (value) {
                    field.onChange(value);
                    trigger('options.blockFormat.hash');
                  }
                }}>
                  {createOptions(algorithms.hash as algorithmProps[], getValues('options.blockFormat.hash'))}
                </Select>
              )}
            </FormField>
            <FormField
              name={'options.objectFormat.splitter'}
              control={control}
              label={'Splitter'}
              sx={{
                display: 'flex',
                flex: 1
              }}>
              {(field) => (
                <Select {...field} value={getValues('options.objectFormat.splitter')} onChange={(_, value) => {
                  if (value) {
                    field.onChange(value);
                    trigger('options.objectFormat.splitter');
                  }
                }}>
                  {createOptions(algorithms.splitter as algorithmProps[], getValues('options.objectFormat.splitter'))}
                </Select>
              )}
            </FormField>
          </Stack>

          <Stack gap={2} flexDirection={'row'} sx={{width: '100%'}}>
            <FormField
              name={'options.blockFormat.version'}
              control={control}
              label={'SetupRepository Format'}
              sx={{
                display: 'flex',
                flex: 1
              }}>
              {(field) => (
                <Select {...field} value={formatVersion}>
                  <Option value={'2'}>Latest format</Option>
                  <Option value={'1'}>Legacy format compatible with v0.8</Option>
                </Select>
              )}
            </FormField>
            <FormField
              name={'options.blockFormat.eccOverheadPercent'}
              control={control}
              label={'Hash Algorithm'}
              sx={{
                display: 'flex',
                flex: 1
              }}>
              {(field) => (
                <Select {...field} value={getValues('options.blockFormat.eccOverheadPercent')} onChange={(_, value: string) => {
                  if (value) {
                    field.onChange(value);
                    trigger('options.blockFormat.eccOverheadPercent');
                  }
                }}>
                  <Option value={'0'}>Disabled</Option>
                  <Option value={'1'}>1%</Option>
                  <Option value={'2'}>2%</Option>
                  <Option value={'5'}>5%</Option>
                  <Option value={'10'}>10%</Option>
                </Select>
              )}
            </FormField>
            <FormField
              name={'options.blockFormat.ecc'}
              control={control}
              label={'Splitter'}
              sx={{
                display: 'flex',
                flex: 1
              }}>
              {(field) => (
                <Select {...field} value={getValues('options.blockFormat.ecc')} disabled={getValues('options.blockFormat.eccOverheadPercent').toString() === '0'} onChange={(_, value) => {
                  if (value) {
                    field.onChange(value);
                    trigger('options.blockFormat.ecc');
                  }
                }}>
                  {getValues('options.blockFormat.eccOverheadPercent').toString() === '0'
                    ? <Option key={'empty'} value={''}>-</Option>
                    : createOptions(algorithms.ecc as algorithmProps[], getValues('options.blockFormat.ecc'))
                  }
                </Select>
              )}
            </FormField>
          </Stack>
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
  )
}

export default CreateRepository;