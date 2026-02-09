import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCustomerDetails } from "../api/customerApi";
import {
  Card, Table, Spin, Alert, Row, Col, Typography, 
  Avatar, Tag, Button, Breadcrumb, ConfigProvider, 
  Divider, Space, Empty, Statistic, Layout
} from "antd";
import { 
  UserOutlined, MailOutlined, PhoneOutlined, 
  HomeOutlined, ShoppingCartOutlined, ArrowLeftOutlined,
  WalletOutlined, HistoryOutlined, SafetyCertificateOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const URL_WEB = process.env.REACT_APP_WEB_URL;

const CustomerDetailsNew = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const data = await getCustomerDetails(id);
        setCustomerData(data);
      } catch (err) {
        setError("Không thể tải dữ liệu chi tiết khách hàng.");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerDetails();
  }, [id]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
      <Space direction="vertical" align="center">
        <Spin size="large" />
        <Text type="secondary">Đang tải hồ sơ khách hàng...</Text>
      </Space>
    </div>
  );

  if (error) return <Alert message="Lỗi hệ thống" description={error} type="error" showIcon className="m-4" />;

  const { customer, orders } = customerData;
  const totalSpent = orders.reduce((sum, order) => sum + (Number(order.price) * order.quantity), 0);

  const columns = [
    {
      title: 'MÃ ĐƠN',
      dataIndex: 'order_id',
      key: 'order_id',
      width: 100,
      render: (id) => <Tag color="blue">#{id}</Tag>,
    },
    {
      title: 'SẢN PHẨM',
      key: 'product',
      minWidth: 250,
      render: (_, record) => (
        <Space>
          <Avatar 
            shape="rounded" 
            size={50} 
            src={`${URL_WEB}/uploads/${record.image}`} 
            icon={<HistoryOutlined />}
            className="border"
          />
          <div style={{ maxWidth: 200 }}>
            <Text strong block ellipsis>{record.name}</Text>
            <Text type="secondary" size="small">{record.color} / {record.size}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'S.LƯỢNG',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: 80,
    },
    {
      title: 'TỔNG TIỀN',
      key: 'total',
      align: 'right',
      render: (_, record) => (
        <Text strong color="#5d4037">
          {(Number(record.price) * record.quantity).toLocaleString("vi-VN")}đ
        </Text>
      ),
    },
    {
      title: 'THỜI GIAN',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => <Text type="secondary">{new Date(date).toLocaleDateString('vi-VN')}</Text>,
    },
  ];

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#5d4037", borderRadius: 12 } }}>
      <div className="p-4 bg-light min-vh-100">
        <style>{`
          .glass-card { background: #fff; border: 1px solid #f0ece1; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
          .hero-section { background: #5d4037; border-radius: 20px 20px 0 0; padding: 30px; position: relative; overflow: hidden; }
          .hero-section::after { content: ""; position: absolute; right: -50px; top: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.05); border-radius: 50%; }
          .info-label { color: #8c8c8c; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; display: block; }
          .stat-value { font-family: 'Inter', sans-serif; font-weight: 700; color: #5d4037; }
        `}</style>

        {/* Top Header */}
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <Breadcrumb items={[{ title: "Hệ thống" }, { title: "Khách hàng" }, { title: "Chi tiết" }]} />
          <Button size="large" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text">Trở lại</Button>
        </div>

        <Row gutter={[24, 24]}>
          {/* LEFT: INFO CARD */}
          <Col xs={24} xl={9}>
            <div className="glass-card overflow-hidden">
              <div className="hero-section d-flex align-items-center">
                <Avatar 
                  size={90} 
                  src={`${URL_WEB}/uploads/customers/${customer.images}`} 
                  icon={<UserOutlined />}
                  className="border border-3 border-white shadow"
                />
                <div className="ms-4">
                  <Title level={3} style={{ color: '#fff', margin: 0 }}>{customer.full_name}</Title>
                  <Tag color="gold" icon={<SafetyCertificateOutlined />}>Member ID: #{customer.id}</Tag>
                </div>
              </div>

              <div className="p-4">
                <Row gutter={[0, 24]}>
                  <Col span={24}>
                    <span className="info-label">Thông tin liên lạc</span>
                    <Space direction="vertical" className="w-100">
                      <Space><MailOutlined className="text-muted" /> <Text strong>{customer.email}</Text></Space>
                      <Space><PhoneOutlined className="text-muted" /> <Text strong>{customer.phone}</Text></Space>
                    </Space>
                  </Col>
                  
                  <Col span={24}>
                    <span className="info-label">Địa chỉ đăng ký</span>
                    <Space align="start"><HomeOutlined className="text-muted mt-1" /> <Text>{customer.address}</Text></Space>
                  </Col>

                  <Col span={24}><Divider className="my-1" /></Col>

                  <Col span={12}>
                    <Statistic 
                      title={<span className="info-label">Tổng đơn hàng</span>}
                      value={orders.length} 
                      prefix={<ShoppingCartOutlined />} 
                      className="stat-value"
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title={<span className="info-label">Tổng chi tiêu</span>}
                      value={totalSpent} 
                      prefix={<WalletOutlined />} 
                      suffix="đ"
                      className="stat-value"
                      
                    />
                  </Col>
                </Row>
              </div>
            </div>
          </Col>

          {/* RIGHT: ORDERS LIST */}
          <Col xs={24} xl={15}>
            <Card 
              className="glass-card" 
              title={<Space><HistoryOutlined /> Lịch sử mua hàng</Space>}
              styles={{ body: { padding: 0 } }}
            >
              <Table 
                columns={columns} 
                dataSource={orders} 
                rowKey="order_id"
                pagination={{ pageSize: 6, simple: true }}
                scroll={{ x: 'max-content' }}
                locale={{ emptyText: <Empty description="Chưa có dữ liệu đơn hàng" /> }}
              />
            </Card>

            <div className="mt-4 p-4 rounded-4" style={{ background: '#5d403710', border: '1px dashed #5d403730' }}>
               <Title level={5}>Ghi chú hệ thống</Title>
               <Text type="secondary">
                 Khách hàng này ưu tiên nhận hàng vào giờ hành chính.
               </Text>
            </div>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
};

export default CustomerDetailsNew;