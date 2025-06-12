import * as React from 'react';
import {Box, BoxProps} from "@mui/joy";

const Root = (props: BoxProps) => (
  <Box
    {...props}
    sx={[
      {
        backgroundColor: 'white',
        display: 'grid',
        gridTemplateRows: '56px 1fr',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      },
      ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
    ]}
  />
)

const Header = (props: BoxProps) => (
  <Box
    component="header"
    {...props}
    sx={[
      {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      ...(Array.isArray(props.sx) ? props.sx : [props.sx])
    ]}
  />
)

const Main = (props: BoxProps) => (
  <Box
    component="main"
    width={'100%'}
    height={'100%'}
    {...props}
    sx={[
      {
        padding: 2,
        boxSizing: 'border-box',
        overflow: 'hidden',
      },
      ...(Array.isArray(props.sx) ? props.sx : [props.sx])
    ]}
  />
)

export default {
  Root,
  Header,
  Main
}