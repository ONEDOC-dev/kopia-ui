import React, {createContext, ReactNode, useContext, useState} from "react";
import {DefaultColorPalette} from "@mui/joy/styles/types";
import {Snackbar, Alert, IconButton, Stack, Typography} from "@mui/joy";
import {CheckCircle, Close, Warning, Report, Info} from "@mui/icons-material";

export interface AlertProps {
  id?: string;
  message: string;
  color: DefaultColorPalette;
  alertChildren?: ReactNode;
}

interface AlertContextProps {
  alerts: AlertProps[];
  addAlert: (alert: AlertProps) => void;
}

export const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const useAlert = () => useContext(AlertContext);

const iconMap = (color: DefaultColorPalette) => {
  const icons = {
    'primary': <Info />,
    'neutral': <Info />,
    'danger': <Report />,
    'success': <CheckCircle />,
    'warning': <Warning />,
  }
  return icons[color];
}

export const ContextAlertProvider = ({children}: {children: React.ReactNode}) => {
  const [alerts, setAlerts] = useState<AlertProps[]>([]);

  const addAlert = (alert: AlertProps) => {
    const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    setAlerts((prevMessages) => [...prevMessages, {id: id, ...alert}]);
  }

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  }

  return (
    <AlertContext.Provider value={{alerts, addAlert}}>
      {children}
      {alerts.map((alert, index) => (
        <Snackbar
          key={index}
          open
          autoHideDuration={3000}
          anchorOrigin={{vertical: 'top', horizontal: 'center'}}
          sx={{zIndex: 9999, p: 0 }}
          onClose={(e, reason) => {
            if (reason === 'clickaway') return;
            removeAlert(alert.id!);
          }}
        >
          <Alert
            key={index}
            color={alert.color}
            variant={'soft'}
            sx={{width: '100%'}}
            startDecorator={iconMap(alert.color)}
            endDecorator={
              <IconButton variant={'soft'} size={'sm'} color={alert.color} onClick={() => removeAlert(alert.id!)}>
                <Close />
              </IconButton>
            }
          >
            <Stack>
              <Typography color={alert.color} fontWeight={'md'}>{alert.message}</Typography>
              {/*{alert.alertChildren}*/}
            </Stack>
          </Alert>
        </Snackbar>
      ))}
    </AlertContext.Provider>
  )
}