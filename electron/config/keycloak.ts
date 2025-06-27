import { KeycloakConfig } from "../ipc/types";

export const keycloakConfig: KeycloakConfig = {
  realm: 'one_cloud',
  authServerUrl: 'https://auth.onedoc.kr',
  clientId: 'oneCloud-client',
  redirectUri: 'onecloud://auth_redirect'
};
