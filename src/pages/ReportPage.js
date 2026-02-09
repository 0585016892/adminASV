import React, { useState } from "react";
import { 
  Tabs, Typography, Breadcrumb, ConfigProvider, 
  Row, Col, Space, Card, Statistic 
} from "antd";
import { 
  BarChartOutlined, 
  ShoppingOutlined, 
  StarOutlined, 
  UsergroupAddOutlined,
  DashboardOutlined,
  ArrowUpOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons";

// Import các component con
import RevenueReport from "../components/report/RevenueReport";
import OrdersReport from "../components/report/OrdersReport";
import TopProductsReport from "../components/report/TopProductsReport";
import CustomerReport from "../components/report/CustomersReport";

const { Title, Text } = Typography;

const ReportPage = () => {
  const [activeTab, setActiveTab] = useState("revenue");

  // Tab items configuration
  const items = [
    {
      key: "revenue",
      label: (
        <Space>
          <BarChartOutlined />
          <span>Doanh thu</span>
        </Space>
      ),
      children: <RevenueReport />,
    },
    {
      key: "orders",
      label: (
        <Space>
          <ShoppingOutlined />
          <span>Đơn hàng</span>
        </Space>
      ),
      children: <OrdersReport />,
    },
    {
      key: "top-products",
      label: (
        <Space>
          <StarOutlined />
          <span>Top Sản phẩm</span>
        </Space>
      ),
      children: <TopProductsReport />,
    },
    {
      key: "customers",
      label: (
        <Space>
          <UsergroupAddOutlined />
          <span>Khách hàng</span>
        </Space>
      ),
      children: <CustomerReport />,
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#5d4037",
          borderRadius: 16,
        },
        components: {
          Tabs: {
            titleFontSize: 16,
            itemActiveColor: "#5d4037",
            itemSelectedColor: "#5d4037",
            inkBarColor: "#5d4037",
            horizontalItemPadding: "16px 32px",
          },
        },
      }}
    >
      <div className="p-4 min-vh-100" style={{ background: "#f8f9fa" }}>
        <style>{`
          .main-report-card {
            background: #ffffff;
            border-radius: 24px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
            border: 1px solid #f0ece1;
          }
          .quick-stat-card {
            border: none;
            box-shadow: 0 4px 15px rgba(0,0,0,0.02);
            transition: transform 0.3s ease;
          }
          .quick-stat-card:hover {
            transform: translateY(-5px);
          }
          .ant-tabs-nav::before {
            border-bottom: 2px solid #f0f0f0 !important;
          }
        `}</style>

        {/* 1. Header & Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb 
            items={[
              { title: <Space><DashboardOutlined /> Quản trị</Space> },
              { title: "Báo cáo phân tích" }
            ]} 
            className="mb-2"
          />
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0, fontWeight: 800, color: "#2c1e1a" }}>
                Trung tâm Báo cáo
              </Title>
              <Text type="secondary">
                <SafetyCertificateOutlined /> Dữ liệu được bảo mật và cập nhật theo thời gian thực
              </Text>
            </Col>
          </Row>
        </div>
        {/* 3. Main Content Wrapper */}
        <div className="main-report-card">
          <Tabs 
            activeKey={activeTab}
            items={items} 
            onChange={(key) => setActiveTab(key)}
            size="large"
            animated={{ inkBar: true, tabs: true }}
            tabBarStyle={{ marginBottom: 40 }}
          />
        </div>

        {/* 4. Footer */}
        <div className="text-center mt-5 pb-4">
          <Text type="secondary" style={{ fontSize: '12px', opacity: 0.7 }}>
            © 2026 Acoustic Harmony Management System. Tất cả dữ liệu đã được mã hóa.
          </Text>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default ReportPage;