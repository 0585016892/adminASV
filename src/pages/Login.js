import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Form, 
  Input, 
  Button, 
  Checkbox, 
  Alert, 
  ConfigProvider, 
  Typography, 
  App 
} from "antd";
import { 
  MailOutlined, 
  LockOutlined, 
  EyeTwoTone, 
  EyeInvisibleOutlined 
} from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import logo from "../img/logo.png";

const { Title, Text } = Typography;

export default function Login() {
  // --- GIỮ NGUYÊN LOGIC CỦA BẠN ---
  const API_URL_LOGIN = process.env.REACT_APP_API_URL;
  const { login } = useAuth();
  const [email, setEmail] = useState(localStorage.getItem("rememberEmail") || "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");
    setShake(false);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL_LOGIN}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Đăng nhập thất bại");
        setShake(true);
        setIsLoading(false);
        return;
      }

      login({ user: data.user, token: data.token, role: data.role });
      remember ? localStorage.setItem("rememberEmail", email) : localStorage.removeItem("rememberEmail");
      setIsLoading(false);
      navigate("/");
    } catch {
      setError("Lỗi mạng hoặc server");
      setShake(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!shake) return;
    const timer = setTimeout(() => setShake(false), 500);
    return () => clearTimeout(timer);
  }, [shake]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#5d4037", // Màu nâu Walnut
          borderRadius: 12,
          fontFamily: "'Inter', sans-serif",
          colorBgContainer: "#ffffff",
        },
        components: {
          Input: {
            controlHeight: 45,
            colorBgContainer: "#faf9f6",
          },
          Button: {
            controlHeight: 45,
            fontWeight: 600,
          }
        }
      }}
    >
      <div className="login-wrapper">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Inter:wght@400;500;600&display=swap');

          .login-wrapper {
            background-color: #fdfcf8;
            background-image: radial-gradient(#dcd7cc 0.5px, transparent 0.5px);
            background-size: 24px 24px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .login-card {
            background: #ffffff;
            padding: 48px 40px;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(93, 64, 55, 0.06);
            width: 100%;
            max-width: 420px;
            border: 1px solid #f1ece1;
          }

          .login-header {
            text-align: center;
            margin-bottom: 32px;
          }

          .login-logo {
            height: 80px;
            margin-bottom: 16px;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.05));
          }

          .brand-title {
            font-family: 'Playfair Display', serif !important;
            color: #4a332c !important;
            margin-bottom: 4px !important;
          }

          .custom-alert {
            margin-bottom: 24px;
            border-radius: 10px;
          }

          .shake {
            animation: shake-anim 0.4s cubic-bezier(.36,.07,.19,.97) both;
          }

          @keyframes shake-anim {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
          }

          .ant-form-item-label > label {
            color: #5d4037 !important;
            font-weight: 500;
          }
        `}</style>

        <div className={`login-card ${shake ? "shake" : ""}`}>
          <div className="login-header">
            <img src={logo} alt="Logo" className="login-logo" />
            <Title level={3} className="brand-title">Acoustic Admin</Title>
            <Text type="secondary">Đăng nhập để điều phối giai điệu</Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              className="custom-alert"
            />
          )}

          <Form
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ email, remember }}
            requiredMark={false}
          >
            <Form.Item
              label="Email quản trị"
              name="email"
              rules={[{ required: true, type: 'email', message: 'Vui lòng nhập đúng định dạng email!' }]}
            >
              <Input 
                prefix={<MailOutlined className="text-muted" />} 
                placeholder="admin@asv.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Item>

            <Form.Item
              label="Mật mã"
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-muted" />}
                placeholder="••••••••"
                iconRender={(visible) => (visible ? <EyeTwoTone twoToneColor="#c19a6b" /> : <EyeInvisibleOutlined />)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>

            <Form.Item>
              <div className="d-flex justify-content-between align-items-center">
                <Checkbox 
                  checked={remember} 
                  onChange={(e) => setRemember(e.target.checked)}
                >
                  Ghi nhớ email
                </Checkbox>
              </div>
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                block
                className="btn-acoustic"
                style={{ backgroundColor: '#5d4037' }}
              >
                {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </ConfigProvider>
  );
}