import React from "react";
import { MainContainer } from "../components";
import { ConfigProvider, Layout } from "antd";

const { Content } = Layout;

const Home = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#5d4037", // Màu nâu Walnut chủ đạo
          borderRadius: 16,        // Bo góc đồng nhất với Dashboard
          fontFamily: "'Inter', sans-serif",
        },
      }}
    >
      <Layout style={{ background: "transparent" }}>
        <Content 
          className="home-content"
          style={{ 
            padding: "24px", // Tương đương px-md-4 py-3 của Bootstrap
            minHeight: "100vh",
            backgroundColor: "#fdfcf8" // Màu nền kem đồng bộ
          }}
        >
          {/* MainContainer chính là component Dashboard chúng ta vừa làm lại */}
          <MainContainer />
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default Home;