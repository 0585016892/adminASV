import React, { useEffect, useState } from "react";
import { 
  Table, Button, Input, Select, Space, Tag, Typography, 
  Tooltip, Modal, Breadcrumb, ConfigProvider, Switch, 
  Card, Row, Col, Spin, Empty, Avatar 
} from "antd";
import { 
  SearchOutlined, DeleteOutlined, EyeOutlined, 
  UserOutlined, FilterOutlined, ExclamationCircleOutlined,
  PhoneOutlined, MailOutlined, HomeOutlined
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
  filterKhachhang,
  deleteKhachhang,
  updateCustomerStatus,
} from "../api/customerApi";
import { useAuth } from "../contexts/AuthContext";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const { Title, Text } = Typography;
const { confirm } = Modal;

const DanhSachKhachhang = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalKhachhang, setTotalKhachhang] = useState(0);
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    keyword: "",
    status: "",
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await filterKhachhang(filters);
      setCustomers(data.customers);
      setTotalKhachhang(data.totalCustomers);
    } catch (error) {
      showErrorToast("Lỗi", "Không thể tải danh sách khách hàng.");
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = (id) => {
    confirm({
      title: 'Xác nhận xóa khách hàng?',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: 'Dữ liệu khách hàng sẽ bị xóa vĩnh viễn khỏi hệ thống.',
      okText: 'Xóa ngay',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const result = await deleteKhachhang(id, user.id);
          showSuccessToast("Thành công", result.message);
          fetchData();
        } catch (error) {
          showErrorToast("Lỗi", error.message || "Không thể xóa khách hàng.");
        }
      },
    });
  };

  const handleStatusChange = async (id, checked) => {
    const newStatus = checked ? "active" : "inactive";
    try {
      await updateCustomerStatus(id, newStatus, user.id);
      setCustomers(prev => 
        prev.map(cus => cus.id === id ? { ...cus, status: newStatus } : cus)
      );
      showSuccessToast("Thành công", "Đã cập nhật trạng thái khách hàng.");
    } catch (error) {
      showErrorToast("Lỗi", "Cập nhật trạng thái thất bại.");
    }
  };

  const columns = [
    {
      title: 'KHÁCH HÀNG',
      key: 'customer',
      render: (_, record) => (
        <Space size="middle">
          <Avatar 
            style={{ backgroundColor: '#5d4037' }} 
            icon={<UserOutlined />} 
            src={record.avatar}
          />
          <Space direction="vertical" size={0}>
            <Text strong>{record.full_name}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>ID: KH0000{record.id}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'LIÊN HỆ',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '13px' }}><MailOutlined /> {record.email}</Text>
          <Text style={{ fontSize: '13px' }}><PhoneOutlined /> {record.phone}</Text>
        </Space>
      ),
    },
    {
      title: 'ĐỊA CHỈ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Text type="secondary"><HomeOutlined /> {text}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status, record) => (
        user?.role === "admin" ? (
          <Space>
            <Switch 
              size="small"
              checked={status === "active"} 
              onChange={(checked) => handleStatusChange(record.id, checked)}
            />
            <Tag color={status === "active" ? "green" : "red"} style={{ borderRadius: '10px' }}>
              {status === "active" ? "Hoạt động" : "Khóa"}
            </Tag>
          </Space>
        ) : (
          <Tag>{status === "active" ? "Hoạt động" : "Khóa"}</Tag>
        )
      ),
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined style={{ color: '#5d4037' }} />} 
              as={Link}
              href={`/customers/details/${record.id}`}
            />
          </Tooltip>
          {user?.role === "admin" && (
            <Tooltip title="Xóa">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => showDeleteConfirm(record.id)}
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
          .customer-table .ant-table-thead > tr > th { background: #fdfcf8; font-weight: 700; }
          .filter-card { border-radius: 12px; border: 1px solid #f0ece1; margin-bottom: 24px; }
        `}</style>

        {/* Header */}
        <div className="mb-4">
          <Breadcrumb items={[{ title: "Hệ thống" }, { title: "Khách hàng" }]} className="mb-2" />
          <Title level={3}><UserOutlined /> Quản lý Khách hàng</Title>
        </div>

        {/* Filters */}
        <Card className="filter-card shadow-sm">
          <Row gutter={16} align="bottom">
            <Col xs={24} md={8}>
              <Text strong><SearchOutlined /> Tìm kiếm</Text>
              <Input 
                placeholder="Tên, Email hoặc Số điện thoại..." 
                size="large"
                className="mt-1"
                allowClear
                value={filters.keyword}
                onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value, page: 1 }))}
              />
            </Col>
            <Col xs={24} md={6}>
              <Text strong><FilterOutlined /> Trạng thái</Text>
              <Select 
                className="w-100 mt-1" 
                size="large"
                value={filters.status}
                onChange={(val) => setFilters(prev => ({ ...prev, status: val, page: 1 }))}
                options={[
                  { label: "Tất cả trạng thái", value: "" },
                  { label: "Đang hoạt động", value: "active" },
                  { label: "Đang bị khóa", value: "inactive" },
                ]}
              />
            </Col>
            <Col xs={24} md={10} className="text-end">
              <Text type="secondary">Tổng số khách hàng: <b>{totalKhachhang}</b></Text>
            </Col>
          </Row>
        </Card>

        {/* Table Area */}
        <div className="bg-white p-3 rounded-4 border shadow-sm">
          <Table 
            className="customer-table"
            columns={columns} 
            dataSource={customers} 
            rowKey="id"
            loading={loading}
            pagination={{
              current: filters.page,
              pageSize: filters.limit,
              total: totalKhachhang,
              onChange: (p) => setFilters(prev => ({ ...prev, page: p })),
              position: ['bottomCenter'],
              showSizeChanger: false
            }}
            locale={{
              emptyText: <Empty description="Không tìm thấy khách hàng nào" />
            }}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default DanhSachKhachhang;