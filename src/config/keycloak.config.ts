// import Keycloak from "keycloak-js";
// import {AuthClientInitOptions} from "@react-keycloak/core/lib/types";

// const clientId = 'oneCloud-client';


// export const keycloak = new Keycloak({
//   url: 'https://auth.onedoc.kr',
//   realm: 'one_cloud',
//   clientId: clientId,
// });

// export const initKeycloak: AuthClientInitOptions = {
//   onLoad: 'login-required',
//   checkLoginIframe: false,
//   scope: 'openid profile email default-user-scope',
// }

// export const getKeycloakInstance = () => {
//   return keycloak;
// };

// 키클락 인증이 비활성화되었습니다.
export const keycloak = null;
export const initKeycloak = null;
export const getKeycloakInstance = () => null;

