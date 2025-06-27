import Keycloak from "keycloak-js";
import {AuthClientInitOptions} from "@react-keycloak/core/lib/types";

const clientId = 'oneCloud-client';

export const keycloak = new Keycloak({
  url: 'https://auth.onedoc.kr',
  realm: 'one_cloud',
  clientId: clientId,
});

export const initKeycloak: AuthClientInitOptions = {
  onLoad: 'login-required',
  checkLoginIframe: false,
  scope: 'openid profile email',
}

export const getKeycloakInstance = () => {
  return keycloak;
};

