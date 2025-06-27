import { useKeycloak } from "@react-keycloak/web";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { useDatasourceStore } from "./hooks/useDatasourceStore";

interface AppInitializerProps {
  children: ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();
  const datasourceStore = useDatasourceStore();
  const [loading, setLoading] = useState(true);

  const initializeFromKeycloak = useCallback((tokenParsed: any | null): void => {
    if (!tokenParsed) return;

    if (tokenParsed.AET) {
      datasourceStore.setAet(tokenParsed.AET);
      console.log('AET initialized:', tokenParsed.AET);
    }
  }, [datasourceStore]);

  useEffect(() => {
    setLoading(true);
    if (initialized && keycloak.authenticated && keycloak.tokenParsed) {
      console.log('User authenticated, initializing app configuration');
      initializeFromKeycloak(keycloak.tokenParsed);
      setLoading(false);
    }
    setLoading(false);
  }, [initialized, keycloak.authenticated, keycloak.tokenParsed]);

  return <>{ loading ? <></> : children }</>;

};

export default AppInitializer;