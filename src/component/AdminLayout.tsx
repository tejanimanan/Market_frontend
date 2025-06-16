import React from "react";
import { Layout, theme } from "antd";
import AdminSideBar from "./AdminSideBar";
import { Outlet } from "react-router-dom";
import AppHeader from "./Header";

const {  Content } = Layout;

const AdminLayout: React.FC = () => {
  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
     
      <AppHeader />
      <Layout>
        <AdminSideBar />

        <Layout style={{ padding: "24px", background: "#f0f2f5" }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: "#ffffff",
              borderRadius: borderRadiusLG,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
