import React from 'react'

import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
} from "@mui/joy";
import {SxProps} from "@mui/joy/styles/types";

interface BaseModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  content: React.ReactNode;
  actions?: React.ReactNode;
  modalSx?: SxProps;
}

const BaseModal = ({open, setOpen, title, content, actions, modalSx}: BaseModalProps) => {

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
    >
      <ModalDialog variant={"outlined"} sx={{minWidth: '500px', ...modalSx}}>
        <Stack flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
          <DialogTitle level={'h3'}>{title}</DialogTitle>
          <ModalClose variant={'plain'} sx={{ m: 1 }}/>
        </Stack>
        <Divider />
        <DialogContent>
          {content}
        </DialogContent>
        {actions &&
          <DialogActions>
            <Stack gap={1} flexDirection={'row'}>
              {actions}
            </Stack>
          </DialogActions>
        }
      </ModalDialog>
    </Modal>
  )
}

export default BaseModal;