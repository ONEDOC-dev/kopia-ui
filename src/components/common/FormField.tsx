import React from 'react';
import { Control, Controller, FieldValues, Path, RegisterOptions } from "react-hook-form";
import {SxProps} from "@mui/joy/styles/types";
import FormControl from "@mui/joy/FormControl";
import {FormHelperText, FormLabel, Typography} from "@mui/joy";

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  children: (field: any) => React.ReactNode;
  error?: boolean;
  helperText?: string;
  sx?: SxProps;
  rules?: RegisterOptions<T, Path<T>>;
}

const FormField = <T extends FieldValues>({
  name,
  control,
  label,
  children,
  error,
  helperText,
  sx,
  rules,
}: FormFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <FormControl
          error={error}
          required={!!(rules && rules.required)}
          sx={sx}
        >
          <FormLabel>
            <Typography fontWeight={'bold'}>{label}</Typography>
          </FormLabel>
          {children(field)}
          <FormHelperText>{helperText}</FormHelperText>
        </FormControl>
      )}>

    </Controller>
  )
}

export default FormField;