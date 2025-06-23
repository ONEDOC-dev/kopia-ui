import React, {useEffect, useState} from "react";
// import {AuthClientError, AuthClientEvent, AuthClientInitOptions} from "@react-keycloak/core/lib/types";

// import {keycloak, initKeycloak as initKeycloakConfig} from "./config/keycloak.config";
// import {ReactKeycloakProvider} from "@react-keycloak/web";
// import {useElectronAuth} from "./hooks/useElectronAuth";
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
  // const { isElectron } = useElectronAuth();
  // const [initKeycloak] = useState<AuthClientInitOptions>(initKeycloakConfig);
  const $useTokenStore = useTokenStore();
  const {getRepositoryStatus} = useRepoApi();
  const {setRepositoryStatus} = useRepositoryStatusStore();

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
    const res = await getRepositoryStatus();
    if (res) {
      setRepositoryStatus(res)
    }
  };

  // const handleKeycloakEvent = (type: AuthClientEvent, _error?: AuthClientError) => {
  //   if (!isElectron) return;
  //   switch (type) {
  //     case "onAuthLogout":
  //       keycloak.logout({redirectUri: 'onepacs://auth_logout_redirect'});
  //       alert("Session expired.");
  //       return;
  //   }
  // }

  return (
    // <ReactKeycloakProvider
    //   authClient={keycloak}
    //   initOptions={initKeycloak}
    //   onEvent={handleKeycloakEvent}
    // >
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
    // </ReactKeycloakProvider>
  )
}

export default App