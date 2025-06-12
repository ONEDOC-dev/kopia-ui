import { KeycloakConfig } from "../ipc/types";

export const keycloakConfig: KeycloakConfig = {
  realm: 'dcm4che',
  authServerUrl: 'https://auth.onedoc.kr',
  clientId: 'pacs-electron-app',
  redirectUri: 'onepacs://auth_redirect'
};
