import Keycloak from "keycloak-js";
import {AuthClientInitOptions} from "@react-keycloak/core/lib/types";

const isElectron = window.electron !== undefined;
const clientId = isElectron ? 'pacs-electron-app' : 'pacs-web-app';


export const keycloak = new Keycloak({
  url: 'https://auth.onedoc.kr',
  realm: 'dcm4che',
  clientId: clientId,
});

export const initKeycloak: AuthClientInitOptions = {
  onLoad: 'login-required',
  checkLoginIframe: false,
  scope: 'openid profile email default-user-scope',
}

export const getKeycloakInstance = () => {
  return keycloak;
};

