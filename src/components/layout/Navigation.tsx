import {Tab, tabClasses, TabList, Tabs} from "@mui/joy";
import React, {useEffect, useState} from "react";
import {useKeycloak} from "@react-keycloak/web";
import {useLocation, useNavigate} from "react-router-dom";
import {useRepositoryStatusStore} from "@/store/useRepositoryStatusStore";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabIndex, setTabIndex] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const { keycloak, initialized } = useKeycloak();
  const {repositoryStatus} = useRepositoryStatusStore();
  const tabList = [
    {id: 'backupList', path: '/backupList', label: '백업 리스트', hidden: false},
    {id: 'history', path: '/history', label: '히스토리', hidden: false},
    {id: 'repository', path: repositoryStatus.connected ? '/repositoryManage' : '/setupRepository', label: '저장소 관리', hidden: isAdmin},
  ]

  useEffect(() => {
    if (initialized && keycloak && keycloak.tokenParsed
      && keycloak.tokenParsed.realm_access && keycloak.tokenParsed.realm_access.roles){
      setIsAdmin(keycloak.tokenParsed.realm_access.roles.includes('admin'))
    }
  }, [initialized]);

  useEffect(() => {
    if (location.pathname !== tabList[tabIndex].path) navigate(tabList[tabIndex].path);
  }, [tabIndex]);

  return (
    <Tabs
      aria-label="Pipeline"
      value={tabIndex}
      onChange={(event, value) => setTabIndex(value as number)}
    >
      <TabList
        sx={{
          backgroundColor: 'white',
          pt: 1,
          justifyContent: 'center',
          [`&& .${tabClasses.root}`]: {
            flex: 'initial',
            bgcolor: 'transparent',
            '&:hover': {
              bgcolor: 'transparent',
            },
            [`&.${tabClasses.selected}`]: {
              color: 'primary.plainColor',
              '&::after': {
                height: 2,
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3,
                bgcolor: 'primary.300',
              },
            },
          },
        }}
      >
        {tabList.map((tab) => (
          <Tab key={tab.id} hidden={tab.hidden} indicatorInset sx={{width: '200px', fontWeight: 'bold'}}>
            {tab.label}
          </Tab>
        ))}
      </TabList>
    </Tabs>
  )
}

export default Navigation;