// import https from 'https';
// import { TokenResponse, KeycloakConfig } from '../ipc/types';
// import { keycloakConfig } from '../config/keycloak';

// class AuthService {
//   private config: KeycloakConfig;
//   private readonly httpsAgent = new https.Agent({ rejectUnauthorized: false });
//   constructor(config: KeycloakConfig) {
//     this.config = config;
//   }

//   public getAuthUrl(): string {
//     const params = new URLSearchParams({
//       client_id: this.config.clientId,
//       redirect_uri: this.config.redirectUri,
//       response_type: 'code',
//       scope: 'openid profile email default-user-scope',
//     });

//     return `${this.config.authServerUrl}/realms/${this.config.realm}/protocol/openid-connect/auth?${params.toString()}`;
//   }

//   public async exchangeCodeForToken(code: string, code_verifier?: string): Promise<TokenResponse> {
//     const tokenUrl = `${this.config.authServerUrl}/realms/${this.config.realm}/protocol/openid-connect/token`;
//     const params = new URLSearchParams({
//       grant_type: 'authorization_code',
//       client_id: this.config.clientId,
//       code: code,
//       redirect_uri: this.config.redirectUri,
//     });
//     if (code_verifier) {
//       params.append('code_verifier', code_verifier);
//     }

//     return this.makeTokenRequest(tokenUrl, params);
//   }

//   public async refreshToken(refreshToken: string): Promise<TokenResponse> {
//     const tokenUrl = `${this.config.authServerUrl}/realms/${this.config.realm}/protocol/openid-connect/token`;
//     const params = new URLSearchParams({
//       grant_type: 'refresh_token',
//       client_id: this.config.clientId,
//       refresh_token: refreshToken
//     });

//     return this.makeTokenRequest(tokenUrl, params);
//   }

//   private makeTokenRequest(url: string, params: URLSearchParams): Promise<TokenResponse> {
//     return new Promise((resolve, reject) => {
//       const options = {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//           'Content-Length': Buffer.byteLength(params.toString())
//         },
//         agent: this.httpsAgent,
//       };

//       const req = https.request(url, options, (res) => {
//         let data = '';
//         res.on('data', (chunk) => data += chunk);
//         res.on('end', () => {
//           try {
//             // console.log('@@ response', data);
//             if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
//               const tokenResponse: TokenResponse = JSON.parse(data);
//               resolve(tokenResponse);
//             } else {
//               reject(new Error(`HTTP Error: ${res.statusCode} ${res.statusMessage}`));
//             }
//           } catch (error) {
//             reject(new Error(`Failed to parse token response: ${error}`));
//           }
//         });
//       });
//       req.on('error', (error) => reject(new Error(`Request failed: ${error.message}`)));
//       req.write(params.toString());
//       req.end();
//     });
//   }
// }

// const authService = new AuthService(keycloakConfig);

// export const getAuthUrl = (): string => authService.getAuthUrl();
// export const exchangeCodeForToken = (code: string, code_verifier?: string): Promise<TokenResponse> => authService.exchangeCodeForToken(code, code_verifier);
// export const refreshToken = (refreshToken: string): Promise<TokenResponse> => authService.refreshToken(refreshToken);

// 키클락 인증이 비활성화되었습니다.
export const getAuthUrl = (): string => '';
export const exchangeCodeForToken = (code: string, code_verifier?: string): Promise<any> => Promise.resolve(null);
export const refreshToken = (refreshToken: string): Promise<any> => Promise.resolve(null);
