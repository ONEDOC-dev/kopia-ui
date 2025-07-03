import Keycloak from "keycloak-js";
import {AuthClientInitOptions} from "@react-keycloak/core/lib/types";
import { KeycloakConfig } from "../../electron/ipc/types";

// 공통 설정값
const KEYCLOAK_CONFIG = {
  realm: 'one_cloud',
  authServerUrl: 'https://auth.onedoc.kr',
  clientId: 'oneCloud-client',
} as const;

// 웹용 Keycloak 인스턴스
export const keycloak = new Keycloak({
  url: KEYCLOAK_CONFIG.authServerUrl,
  realm: KEYCLOAK_CONFIG.realm,
  clientId: KEYCLOAK_CONFIG.clientId,
});

// 웹용 초기화 옵션
export const initKeycloak: AuthClientInitOptions = {
  onLoad: 'login-required',
  checkLoginIframe: false,
  scope: 'openid profile email',
}

// 일렉트론용 설정
export const keycloakConfig: KeycloakConfig = {
  realm: KEYCLOAK_CONFIG.realm,
  authServerUrl: KEYCLOAK_CONFIG.authServerUrl,
  clientId: KEYCLOAK_CONFIG.clientId,
  redirectUri: 'onecloud://auth_redirect'
};
