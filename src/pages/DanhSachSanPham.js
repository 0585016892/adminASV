import React, { useState, useEffect } from "react";
import { 
  Table, Button, Input, Select, Space, Row, Col, 
  Card, Typography, Modal, Tag, Tooltip, Avatar, 
  ConfigProvider, Pagination, Empty, Spin
} from "antd";
import { 
  PlusOutlined, FileExcelOutlined, DeleteOutlined, 
  EditOutlined, EyeOutlined, SearchOutlined, 
  InboxOutlined, ExclamationCircleOutlined 
} from "@ant-design/icons";
import {
  filterProducts,
  deleteProduct,
  exportProductsExcel 
} from "../api/productAPI";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const { Title, Text } = Typography;
const { confirm } = Modal;

const DanhSachSanPham = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const URL_WEB = process.env.REACT_APP_WEB_URL;

  // ==== States ====
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 7,
    keyword: "",
    status: "",
  });

  // ==== Fetch Data ====
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await filterProducts(filters);
      setProducts(data.products);
      setTotalProducts(data.totalProducts);
    } catch (error) {
      showErrorToast("Lỗi tải sản phẩm", error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // ==== Handlers ====
  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, keyword: e.target.value, page: 1 }));
  };

  const handleStatusChange = (value) => {
    setFilters(prev => ({ ...prev, status: value, page: 1 }));
  };

  const showDeleteConfirm = (id) => {
    confirm({
      title: 'Xác nhận xóa sản phẩm?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const result = await deleteProduct(id);
          showSuccessToast("Thành công", result.message);
          fetchData(); // Reload lại danh sách
        } catch (error) {
          showErrorToast("Lỗi", error.message);
        }
      },
    });
  };

  // ==== Table Columns ====
  const columns = [
    {
      title: 'MÃ SP',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text code>SP180703{id}</Text>,
      width: 140,
    },
    {
      title: 'HÌNH ẢNH',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <Avatar 
          shape="square" 
          size={60} 
          src={`${URL_WEB}/uploads/${image}`} 
          icon={<InboxOutlined />}
          style={{ border: '1px solid #f0ece1' }}
        />
      ),
      width: 100,
    },
    {
      title: 'TÊN SẢN PHẨM',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'GIÁ BÁN',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <Text type="danger" strong>
          {Number(price).toLocaleString("vi-VN")}₫
        </Text>
      ),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'DANH MỤC',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (cat) => <Tag color="orange">{cat}</Tag>,
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined style={{ color: '#1890ff' }} />} 
              onClick={() => navigate(`/san-pham/details/${record.id}`)}
            />
          </Tooltip>
          
          {user?.role === "admin" && (
            <>
              <Tooltip title="Chỉnh sửa">
                <Button 
                  type="text" 
                  icon={<EditOutlined style={{ color: '#c19a6b' }} />} 
                  onClick={() => navigate(`/san-pham/sua/${record.id}`)}
                />
              </Tooltip>
              <Tooltip title="Xóa">
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => showDeleteConfirm(record.id)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#5d4037",
          borderRadius: 12,
        },
      }}
    >
      <div className="container-fluid p-4">
        <style>{`
          .product-table-card { border-radius: 20px; border: 1px solid #f0ece1; overflow: hidden; }
          .title-font { font-family: 'Playfair Display', serif; }
          .ant-table-thead > tr > th { background: #fdfcf8 !important; }
        `}</style>

        {/* Header Section */}
        <Row className="mb-4 align-items-center" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Title level={3} className="title-font m-0">
              <InboxOutlined className="me-2" /> Quản lý sản phẩm
            </Title>
            <Text type="secondary">Tổng số: {totalProducts} sản phẩm hiện có</Text>
          </Col>
          <Col xs={24} md={12} className="text-md-end">
            {user?.role === "admin" && (
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  size="large"
                  onClick={() => navigate("/san-pham/them")}
                >
                  Thêm mới
                </Button>
                <Button 
                  icon={<FileExcelOutlined />} 
                  size="large"
                  onClick={exportProductsExcel}
                  style={{ borderColor: '#27ae60', color: '#27ae60' }}
                >
                  Xuất Excel
                </Button>
              </Space>
            )}
          </Col>
        </Row>

        {/* Filter Section */}
        <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: 16 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Tìm tên hoặc mã sản phẩm..."
                prefix={<SearchOutlined />}
                allowClear
                onChange={handleSearch}
                size="large"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                className="w-100"
                placeholder="Trạng thái hiển thị"
                size="large"
                allowClear
                onChange={handleStatusChange}
              >
                <Select.Option value="active">Đang hiển thị</Select.Option>
                <Select.Option value="inactive">Đang ẩn</Select.Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Table Section */}
        <Card className="product-table-card border-0 shadow-sm">
          <Table 
            columns={columns} 
            dataSource={products} 
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: 800 }}
            locale={{ emptyText: <Empty description="Không tìm thấy sản phẩm nào" /> }}
          />
          
          <div className="p-3 d-flex justify-content-between align-items-center bg-white">
            <Text type="secondary">Hiển thị {products.length} trên tổng số {totalProducts}</Text>
            <Pagination
              current={filters.page}
              total={totalProducts}
              pageSize={filters.limit}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default DanhSachSanPham;