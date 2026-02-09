import React from "react";
import { Result, Button, Typography, Card } from "antd";
import { HomeOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const { Text } = Typography;

const Unauthorized = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f2f5", // Màu nền chuẩn của Ant Design
      }}
    >
      <Card
        bordered={false}
        className="shadow-sm"
        style={{
          maxWidth: 500,
          borderRadius: 16,
          textAlign: "center",
        }}
      >
        <Result
          status="403" // Trạng thái Forbidden chuẩn
          icon={<LockOutlined style={{ color: "#ff4d4f", fontSize: 64 }} />}
          title={<span style={{ fontWeight: 700 }}>TRUY CẬP BỊ TỪ CHỐI</span>}
          subTitle={
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Xin lỗi <Text strong>{user?.full_name || "bạn"}</Text>, tài khoản của bạn (Role: <Text code>{user?.role || "Khách"}</Text>) không có đủ đặc quyền để xem nội dung này.
              </Text>
            </div>
          }
          extra={[
            <Button
              type="primary"
              size="large"
              key="console"
              icon={<HomeOutlined />}
              onClick={() => navigate("/")}
              style={{
                borderRadius: 8,
                height: 45,
                padding: "0 30px",
                background: "#1890ff",
              }}
            >
              Về trang chủ
            </Button>,
            <Button 
                key="back" 
                size="large" 
                onClick={() => navigate(-1)}
                style={{ borderRadius: 8, height: 45 }}
            >
              Quay lại
            </Button>,
          ]}
        />
      </Card>
    </div>
  );
};

export default Unauthorized;