import React from "react";
import Layout from "@/components/layout";
import Navigation from "@/components/layout/Navigation";
import {Outlet} from "react-router-dom";
import SettingButton from "@/components/button/SettingButton";

interface DefaultLayoutProps {
  children?: React.ReactNode;
}

const DefaultLayout = ({children}: DefaultLayoutProps) => {

  return (
    <Layout.Root>
      <Layout.Header>
        <Navigation />
        <SettingButton />
      </Layout.Header>
      <Layout.Main>
        {children || <Outlet/>}
      </Layout.Main>
    </Layout.Root>
  )
}

export default DefaultLayout;