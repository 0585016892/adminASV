import React, { useEffect, useState } from "react";
import { 
  Table, Button, Input, Select, Space, Tag, Typography, 
  Tooltip, Modal, Breadcrumb, ConfigProvider, Card, 
  Row, Col, Spin, Empty, Pagination, Divider 
} from "antd";
import { 
  SearchOutlined, DeleteOutlined, EyeOutlined, 
  FileExcelOutlined, ShoppingCartOutlined, 
  ExclamationCircleOutlined, UserOutlined,
  ClockCircleOutlined, CheckCircleOutlined,
  CloseCircleOutlined, CarOutlined
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { 
  filterOrders, 
  deleteOrderById, 
  updateOrderStatus 
} from "../api/orderApi";
import * as XLSX from "xlsx";
import { useAuth } from "../contexts/AuthContext";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const { Title, Text } = Typography;
const { confirm } = Modal;

const OrderList = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    current: 1,
    pageSize: 10,
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    keyword: "",
    status: "",
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await filterOrders(filters);
      setOrders(data.orders);
      setPagination({
        total: data.totalOrders,
        current: data.currentPage,
        pageSize: filters.limit,
      });
    } catch (err) {
      showErrorToast("Lỗi", "Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, user.id);
      showSuccessToast("Thành công", "Đã cập nhật trạng thái đơn hàng.");
      fetchOrders();
    } catch (err) {
      showErrorToast("Lỗi", "Cập nhật trạng thái thất bại.");
    }
  };

  const showDeleteConfirm = (id) => {
    confirm({
      title: 'Xóa đơn hàng này?',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: 'Hành động này sẽ xóa vĩnh viễn dữ liệu đơn hàng.',
      okText: 'Xác nhận xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteOrderById(id);
          showSuccessToast("Thành công", "Đã xóa đơn hàng.");
          fetchOrders();
        } catch {
          showErrorToast("Thất bại", "Không thể xóa đơn hàng.");
        }
      },
    });
  };

  const handleExportToExcel = () => {
    const dataToExport = orders.map((order) => ({
      "Mã ĐH": `DH${order.order_id.toString().padStart(4, "0")}`,
      "Khách hàng": order.customer_name,
      "SĐT": order.customer_phone,
      "Tổng tiền": order.final_total,
      "Trạng thái": order.status,
      "Ngày tạo": new Date(order.created_at).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, "Danh_sach_don_hang.xlsx");
  };

  const getStatusTag = (status) => {
    const statusMap = {
      "Chờ xử lý": { color: "warning", icon: <ClockCircleOutlined /> },
      "Đang giao": { color: "processing", icon: <CarOutlined /> },
      "Đã giao": { color: "success", icon: <CheckCircleOutlined /> },
      "Đã hủy": { color: "error", icon: <CloseCircleOutlined /> },
    };
    const config = statusMap[status] || { color: "default", icon: null };
    return <Tag icon={config.icon} color={config.color}>{status.toUpperCase()}</Tag>;
  };

  const columns = [
    {
      title: 'MÃ ĐƠN',
      dataIndex: 'order_id',
      key: 'order_id',
      width: 100,
      render: (id) => <Text strong color="#5d4037">#{id.toString().padStart(4, "0")}</Text>,
    },
    {
      title: 'KHÁCH HÀNG',
      key: 'customer',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.customer_name}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.customer_phone}</Text>
        </Space>
      ),
    },
    {
      title: 'TỔNG TIỀN',
      dataIndex: 'final_total',
      key: 'final_total',
      render: (total) => (
        <Text strong style={{ color: '#b35d33' }}>
          {Number(total).toLocaleString()}đ
        </Text>
      ),
    },
    {
      title: 'NGÀY TẠO',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => <Text type="secondary">{new Date(date).toLocaleDateString()}</Text>,
    },
    {
      title: 'TRẠNG THÁI',
      key: 'status',
      width: 180,
      render: (_, record) => (
        <Select
          value={record.status}
          onChange={(val) => handleStatusChange(record.order_id, val)}
          disabled={record.status === "Đã giao" || record.status === "Đã hủy"}
          style={{ width: '100%' }}
          status={record.status === "Đã hủy" ? "error" : ""}
        >
          <Select.Option value="Chờ xử lý">Chờ xử lý</Select.Option>
          <Select.Option value="Đang giao">Đang giao</Select.Option>
          <Select.Option value="Đã giao">Đã giao</Select.Option>
          <Select.Option value="Đã hủy">Đã hủy</Select.Option>
        </Select>
      ),
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Link to={`/don-hang/chi-tiet/${record.order_id}`}>
              <Button type="text" icon={<EyeOutlined style={{ color: '#5d4037' }} />} />
            </Link>
          </Tooltip>
          {user?.role === "admin" && (
            <Tooltip title="Xóa đơn">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => showDeleteConfirm(record.order_id)} 
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#5d4037", borderRadius: 8 } }}>
      <div className="p-4 bg-light min-vh-100">
        <style>{`
          .order-table .ant-table-thead > tr > th { background: #fdfcf8; font-weight: 700; text-transform: uppercase; font-size: 12px; }
          .filter-card { border-radius: 12px; border: 1px solid #f0ece1; margin-bottom: 24px; }
          .export-btn:hover { background: #27ae60 !important; border-color: #27ae60 !important; }
        `}</style>

        {/* Header Section */}
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <Breadcrumb items={[{ title: "Quản trị" }, { title: "Giao dịch" }, { title: "Đơn hàng" }]} className="mb-2" />
            <Title level={3}><ShoppingCartOutlined /> Quản lý Đơn hàng</Title>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<FileExcelOutlined />} 
              onClick={handleExportToExcel}
              className="export-btn"
              style={{ background: '#2ecc71', borderColor: '#2ecc71' }}
            >
              Xuất báo cáo Excel
            </Button>
          </Col>
        </Row>

        {/* Filters Area */}
        <Card className="filter-card shadow-sm">
          <Row gutter={16}>
            <Col xs={24} md={12} lg={8}>
              <Text strong>Tìm kiếm thông minh</Text>
              <Input 
                prefix={<SearchOutlined />} 
                placeholder="Mã ĐH, Tên, Số điện thoại..." 
                className="mt-2"
                size="large"
                allowClear
                value={filters.keyword}
                onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value, page: 1 }))}
              />
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Text strong>Lọc theo trạng thái</Text>
              <Select 
                className="w-100 mt-2" 
                size="large"
                value={filters.status}
                onChange={(val) => setFilters(prev => ({ ...prev, status: val, page: 1 }))}
                options={[
                  { label: "Tất cả đơn hàng", value: "" },
                  { label: "Chờ xử lý", value: "Chờ xử lý" },
                  { label: "Đang giao", value: "Đang giao" },
                  { label: "Đã giao", value: "Đã giao" },
                  { label: "Đã hủy", value: "Đã hủy" },
                ]}
              />
            </Col>
          </Row>
        </Card>

        {/* Main Table */}
        <div className="bg-white p-3 rounded-4 border shadow-sm">
          <Table 
            className="order-table"
            columns={columns} 
            dataSource={orders} 
            rowKey="order_id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: (p) => setFilters(prev => ({ ...prev, page: p })),
              position: ['bottomCenter'],
              showSizeChanger: false
            }}
            locale={{ emptyText: <Empty description="Không có đơn hàng nào" /> }}
          />
          <Divider />
          <Text type="secondary">Tổng số đơn hàng: <b>{pagination.total}</b> đơn hàng</Text>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default OrderList;