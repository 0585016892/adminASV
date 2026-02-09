import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, Table, Spin, Alert, Row, Col, Typography, 
  Tag, Button, Breadcrumb, ConfigProvider, Select, 
  Divider, Space, Descriptions, Badge, Result
} from "antd";
import { 
  ArrowLeftOutlined, PrinterOutlined, FilePdfOutlined, 
  ShoppingCartOutlined, UserOutlined, ClockCircleOutlined,
  CheckCircleOutlined, CloseCircleOutlined, CarOutlined,
  DollarCircleOutlined, SnippetsOutlined
} from "@ant-design/icons";
import { getOrderDetails, updateOrderStatus } from "../api/orderApi";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";
import { useAuth } from "../contexts/AuthContext";

const { Title, Text } = Typography;

const OrderDetail = () => {
  const { user } = useAuth();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await getOrderDetails(orderId);
      if (res.success) setOrder(res.order);
      else setError("Không tìm thấy đơn hàng");
    } catch (err) {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, user.id);
      showSuccessToast("Thành công", `Đã chuyển trạng thái sang ${newStatus}`);
      setOrder(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      showErrorToast("Thất bại", "Không thể cập nhật trạng thái");
    }
  };

  const handleDownloadPDF = async () => {
    const input = document.getElementById("invoice-print-area");
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`HoaDon_DH${order.order_id}.pdf`);
  };

  if (loading) return (
    <div className="vh-100 d-flex justify-content-center align-items-center bg-white">
      <Space direction="vertical" align="center"><Spin size="large" /><Text type="secondary">Đang lấy dữ liệu hóa đơn...</Text></Space>
    </div>
  );

  if (error) return <Result status="404" title="Lỗi!" subTitle={error} extra={<Button type="primary" onClick={() => navigate(-1)}>Quay lại</Button>} />;

  const statusConfig = {
    "Đang xử lý": { color: "orange", icon: <ClockCircleOutlined /> },
    "Đang giao": { color: "blue", icon: <CarOutlined /> },
    "Đã giao": { color: "green", icon: <CheckCircleOutlined /> },
    "Đã hủy": { color: "red", icon: <CloseCircleOutlined /> },
  };

  const columns = [
    { title: 'SẢN PHẨM', dataIndex: 'product_name', key: 'name', render: (text) => <Text strong>{text}</Text> },
    { title: 'SIZE/MÀU', key: 'variant', render: (_, r) => <Tag>{r.size} / {r.color}</Tag> },
    { title: 'ĐƠN GIÁ', dataIndex: 'price', align: 'right', render: (v) => `${Number(v).toLocaleString()}đ` },
    { title: 'S.LƯỢNG', dataIndex: 'quantity', align: 'center' },
    { title: 'TỔNG', key: 'total', align: 'right', render: (_, r) => <Text strong>{(r.price * r.quantity).toLocaleString()}đ</Text> },
  ];

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#5d4037", borderRadius: 12 } }}>
      <div className="p-4 bg-light min-vh-100">
        
        {/* Top Actions */}
        <div className="mb-4 d-flex justify-content-between align-items-center no-print">
          <Breadcrumb items={[{ title: "Đơn hàng" }, { title: `Chi tiết DH${orderId}` }]} />
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Quay lại</Button>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>In hóa đơn</Button>
            <Button type="primary" icon={<FilePdfOutlined />} onClick={handleDownloadPDF}>Tải PDF</Button>
          </Space>
        </div>

        <Row gutter={[24, 24]}>
          {/* Main Invoice Content */}
          <Col xs={24} lg={17}>
            <div id="invoice-print-area" className="bg-white p-5 shadow-sm rounded-4 border">
              <Row justify="space-between" align="top">
                <Col>
                  <Title level={2} style={{ color: "#5d4037", margin: 0 }}>HÓA ĐƠN BÁN HÀNG</Title>
                  <Text type="secondary">Mã đơn hàng: </Text>
                  <Text strong>DH{order.order_id.toString().padStart(4, "0")}</Text>
                </Col>
                <Col className="text-end">
                  <div style={{ background: "#5d4037", padding: "10px 20px", borderRadius: "8px" }}>
                    <Text className="text-white">Trạng thái: </Text>
                    <Tag color={statusConfig[order.status]?.color} style={{ border: 'none', fontWeight: 'bold' }}>
                      {order.status.toUpperCase()}
                    </Tag>
                  </div>
                </Col>
              </Row>

              <Divider />

              <Row gutter={40}>
                <Col span={12}>
                  <Descriptions title={<Space><UserOutlined /> Thông tin khách hàng</Space>} column={1}>
                    <Descriptions.Item label="Họ tên"><Text strong>{order.customer_name}</Text></Descriptions.Item>
                    <Descriptions.Item label="Điện thoại">{order.customer_phone}</Descriptions.Item>
                    <Descriptions.Item label="Email">{order.customer_email}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">{order.address}</Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={12}>
                  <Descriptions title={<Space><ShoppingCartOutlined /> Chi tiết giao dịch</Space>} column={1}>
                    <Descriptions.Item label="Ngày đặt hàng">{new Date(order.created_at).toLocaleString('vi-VN')}</Descriptions.Item>
                    <Descriptions.Item label="Hình thức">Thanh toán tiền mặt</Descriptions.Item>
                    <Descriptions.Item label="Ghi chú">
                      <Text type="warning" italic>{order.note || "Không có ghi chú"}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>

              <Table 
                dataSource={order.items} 
                columns={columns} 
                pagination={false} 
                className="my-4"
                rowKey="product_id"
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4} align="right"><Text>Tổng giá trị sản phẩm:</Text></Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right"><Text>{Number(order.total).toLocaleString()}đ</Text></Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4} align="right"><Text>Khấu trừ giảm giá:</Text></Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right"><Text type="danger">-{Number(order.discount).toLocaleString()}đ</Text></Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4} align="right"><Title level={4}>TỔNG THANH TOÁN:</Title></Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right"><Title level={4} style={{ color: "#d32f2f" }}>{Number(order.final_total).toLocaleString()}đ</Title></Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
              
              <div className="mt-5 text-center">
                <Text italic type="secondary">Cảm ơn bạn đã tin tưởng lựa chọn phong cách Acoustic Harmony!</Text>
              </div>
            </div>
          </Col>

          {/* Sidebar: Status Update */}
          <Col xs={24} lg={7} className="no-print">
            <Card title={<Space><DollarCircleOutlined /> Quản lý trạng thái</Space>} className="shadow-sm border-0 rounded-4">
              <Text type="secondary" block className="mb-2">Cập nhật tiến độ đơn hàng:</Text>
              <Select
                size="large"
                className="w-100"
                value={order.status}
                onChange={handleStatusChange}
                disabled={order.status === "Đã giao" || order.status === "Đã hủy"}
              >
                {Object.keys(statusConfig).map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
              </Select>
              
              <Divider />
              
              <div style={{ background: "#fffbe6", padding: "15px", borderRadius: "8px", border: "1px solid #ffe58f" }}>
                <Space align="start">
                  <SnippetsOutlined style={{ color: "#faad14", marginTop: "4px" }} />
                  <Text size="small" type="secondary">
                    {order.status === "Đã giao" || order.status === "Đã hủy" 
                      ? "Đơn hàng đã kết thúc vòng đời, không thể chỉnh sửa thêm." 
                      : "Lưu ý: Chuyển sang 'Đã hủy' sẽ hoàn lại kho số lượng sản phẩm."}
                  </Text>
                </Space>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
};

export default OrderDetail;