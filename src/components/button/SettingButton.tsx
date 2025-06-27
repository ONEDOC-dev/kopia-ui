import React from 'react';
import {Dropdown, IconButton, Menu, MenuButton, MenuItem} from "@mui/joy";
import {SettingsOutlined} from "@mui/icons-material";
import { keycloak } from '@/config/keycloak.config';
// import {keycloak} from "@/config/keycloak.config";

const SettingButton = () => {

  const handleLogout = () => {
    const isElectron = typeof window.electron !== 'undefined';
    if (!isElectron) return keycloak.logout();
    return keycloak.logout({redirectUri: 'onecloud://auth_logout_redirect'});
  }

  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{ root: { color: 'neutral' }}}
        sx={{margin: 4}}
      >
        <SettingsOutlined />
      </MenuButton>
      <Menu placement={'bottom-end'}>
        <MenuItem onClick={handleLogout}>
          로그아웃
        </MenuItem>
      </Menu>
    </Dropdown>
  )
}

export default SettingButton;