import { useState, useEffect } from 'react';

export const useElectronAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isElectron = typeof window.electron !== 'undefined';
  const [token, setToken] = useState<any>({});

  useEffect(() => {
    const authStart = async () => {
      const res = await window.electron.authStart();
      console.log(res);
    }
    if (isElectron) {
      setIsAuthenticated(false);
      window.electron.onAuthError((error: string) => {
        setAuthError(error);
        setIsInitialized(true);
      });
      window.electron.onAuthSuccess(async (tokenResponse: any) => {
        authSuccess(tokenResponse);
        // const isAuth = await keycloak.init({...initKeycloak, token: tokenResponse.access_token, refreshToken: tokenResponse.refresh_token})
      });
      authStart();
    }
  }, [isElectron]);

  const authSuccess = (tokenResponse: any) => {
    setToken(tokenResponse);
    setIsAuthenticated(true);
    setIsInitialized(true);
  }


  return { isElectron, isAuthenticated, authError, isInitialized, token };
};
