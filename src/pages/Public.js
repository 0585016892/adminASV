import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu as SidebarMenu, ChatWidget } from "../components";
import { Layout, ConfigProvider, Button, Drawer } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";

const { Sider, Content } = Layout;

const Public = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#5d4037",
          borderRadius: 16,
        },
      }}
    >
      <Layout style={{ minHeight: "100vh", backgroundColor: "#fdfcf8" }}>
        <style>{`
          .main-layout {
            transition: all 0.2s;
            background: #fdfcf8;
          }
          .ant-layout-sider {
            background: #fdfcf8 !important;
            border-right: 1px solid #eeebe3;
          }
          .mobile-toggle-btn {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .chat-widget-wrapper {
            position: fixed;
            right: 2%;
            bottom: 5%;
            z-index: 9999;
          }
          @media (max-width: 768px) {
            .desktop-sider { display: none !important; }
            .content-area { padding-top: 60px !important; }
          }
        `}</style>

        {/* Nút mở Menu cho Mobile */}
        <Button
          className="mobile-toggle-btn d-md-none"
          type="primary"
          shape="circle"
          icon={mobileOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          onClick={() => setMobileOpen(!mobileOpen)}
        />

        {/* Sidebar cho Desktop */}
        <Sider
          className="desktop-sider"
          width={280}
          trigger={null}
          collapsible
          collapsed={collapsed}
          breakpoint="lg"
          onCollapse={(value) => setCollapsed(value)}
        >
          <SidebarMenu />
        </Sider>

        {/* Sidebar cho Mobile (Drawer) */}
        <Drawer
          placement="left"
          onClose={() => setMobileOpen(false)}
          open={mobileOpen}
          width={280}
          styles={{ body: { padding: 0 } }}
          closable={false}
        >
          <SidebarMenu />
        </Drawer>

        {/* Vùng nội dung chính */}
        <Layout className="main-layout">
          <Content className="" style={{ padding: "0", minHeight: "100vh" }}>
            <Outlet />
          </Content>
        </Layout>

        {/* Chat Widget nổi */}
        <div className="chat-widget-wrapper">
          <ChatWidget />
        </div>
      </Layout>
    </ConfigProvider>
  );
};

export default Public;