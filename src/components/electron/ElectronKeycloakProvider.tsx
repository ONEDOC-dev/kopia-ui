import React, { useState, useEffect } from 'react';
import { ReactKeycloakProvider } from '@react-keycloak/web';

interface ElectronKeycloak {
  init: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
  refreshToken: string | null;
}

const ElectronKeycloakProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [electronKeycloak, setElectronKeycloak] = useState<ElectronKeycloak | null>(null);

  useEffect(() => {
    const setupElectronKeycloak = async () => {
      if (window.electron) {
        let tokenResponse: any | null = null;

        const keycloak: ElectronKeycloak = {
          init: async () => {
            await window.electron.startAuth();
          },
          login: async () => {},
          logout: async () => {},
          get token() {
            return tokenResponse?.access_token || null;
          },
          get refreshToken() {
            return tokenResponse?.refresh_token || null;
          }
        };

        await keycloak.init();
        setElectronKeycloak(keycloak);
      }
    };

    setupElectronKeycloak();
  }, []);

  if (!electronKeycloak) {
    return <div>Loading...</div>; // 또는 적절한 로딩 컴포넌트
  }

  return (
    <ReactKeycloakProvider authClient={electronKeycloak}>
      {children}
    </ReactKeycloakProvider>
  );
};

export default ElectronKeycloakProvider;