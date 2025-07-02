import React, {useEffect, useState} from "react";
import {AuthClientError, AuthClientEvent, AuthClientInitOptions} from "@react-keycloak/core/lib/types";

import {keycloak, initKeycloak as initKeycloakConfig} from "./config/keycloak.config";
import {ReactKeycloakProvider} from "@react-keycloak/web";
import {useElectronAuth} from "./hooks/useElectronAuth";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

import DefaultLayout from "@/layouts/DefaultLayout";
import BackupList from "@/pages/backupList/BackupList";
import {LocalizationProvider} from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import RepositoryManage from "@/pages/repository/RepositoryManage";
import {useTokenStore} from "@/api/v1";
import useRepoApi from "@/api/v1/useRepoApi";
import {useRepositoryStatusStore} from "@/store/useRepositoryStatusStore";
import SetupRepository from "@/pages/repository/SetupRepository";
import SnapshotList from "@/pages/backupList/SnapshotList";
import History from "@/pages/history/History";
import {ContextAlertProvider} from '@/contexts/ContextAlert';

const App = () => {
  const $useTokenStore = useTokenStore();
  const {getRepositoryStatus} = useRepoApi();
  const {setRepositoryStatus} = useRepositoryStatusStore();
  const {isAuthenticated, token, isElectron} = useElectronAuth();
  const [initKeycloak, setInitKeycloak] = useState<AuthClientInitOptions>(initKeycloakConfig);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const tok = document.head.querySelector(
      'meta[name="kopia-csrf-token"]'
    ) as HTMLMetaElement | null;
    if (tok?.content) {
      $useTokenStore.setToken(tok.content);
    }
  }, []);

  useEffect(() => {
    fetchInitialRepositoryDescription();
  }, []);

  const fetchInitialRepositoryDescription = async () => {
    const maxRetries = 3;
    const retryDelay = 2000; // 2초

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await getRepositoryStatus();
        if (res) {
          setRepositoryStatus(res);
          return; // 성공시 함수 종료
        }
      } catch (error: any) {
        console.warn(`Repository status fetch attempt ${attempt}/${maxRetries} failed:`, error);
        
        // ECONNREFUSED 또는 네트워크 에러인 경우에만 재시도
        const isRetryableError = 
          error?.code === 'ECONNREFUSED' || 
          error?.message?.includes('ECONNREFUSED') ||
          error?.name === 'AggregateError';
        
        if (isRetryableError && attempt < maxRetries) {
          console.log(`Retrying in ${retryDelay}ms... (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else if (attempt === maxRetries) {
          console.error('Failed to fetch repository status after all retries:', error);
          // 최종 실패시에도 앱이 계속 실행되도록 함 (저장소가 설정되지 않은 상태로)
        }
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const _initKeycloak = {...initKeycloakConfig, token: token.access_token, refreshToken: token.refresh_token};
      setInitKeycloak(_initKeycloak);
      setIsInitialized(true);
    } 
  }, [isAuthenticated]);

  if (isElectron && !isInitialized) {
    return <div>Authenticating...</div>;
  }

  const handleKeycloakEvent = (type: AuthClientEvent, _error?: AuthClientError) => {
    if (!isElectron) return;
    switch (type) {
      case "onAuthLogout":
        keycloak.logout({redirectUri: 'onecloud://auth_logout_redirect'});
        alert("Session expired.");
        return;
    }
  }

  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={initKeycloak}
      onEvent={handleKeycloakEvent}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ContextAlertProvider>
          <Router>
            <Routes>
              <Route path={'/'} element={<DefaultLayout />}>
                <Route path="backupList" element={<BackupList />} index />
                <Route path="snapshotList/:path" element={<SnapshotList />} />
                <Route path="repositoryManage" element={<RepositoryManage />} />
                <Route path="history" element={<History />} />
                <Route path="setupRepository" element={<SetupRepository />} />
              </Route>
            </Routes>
          </Router>
        </ContextAlertProvider>
      </LocalizationProvider>
    </ReactKeycloakProvider>
  )
}

export default App