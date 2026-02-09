import React, { useEffect, useState } from "react";
import { 
  Row, Col, Card, Input, Select, Button, Pagination, 
  Modal, Tag, Typography, Space, Empty, Spin, 
  Breadcrumb, ConfigProvider, Tooltip, Divider
} from "antd";
import { 
  SearchOutlined, PlusOutlined, EditOutlined, 
  DeleteOutlined, ExclamationCircleOutlined, 
  AppstoreOutlined, FilterOutlined 
} from "@ant-design/icons";
import { filterDanhmuc, deleteDanhMuc } from "../api/danhmucApi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const DsDanhMuc = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [danhmuc, setDanhmuc] = useState([]);
  const [totalDanhMuc, setTotalDanhMuc] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    keyword: "",
    status: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await filterDanhmuc(filters);
        setDanhmuc(data.categories);
        setTotalDanhMuc(data.totalCategories);
        setTotalPages(data.totalPages);
      } catch (error) {
        showErrorToast("Lỗi", "Không thể tải danh sách danh mục.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, keyword: e.target.value, page: 1 }));
  };

  const handleStatusChange = (value) => {
    setFilters(prev => ({ ...prev, status: value, page: 1 }));
  };

  const showDeleteConfirm = (id) => {
    confirm({
      title: 'Xóa danh mục này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Tất cả các sản phẩm thuộc danh mục này có thể bị ảnh hưởng. Bạn vẫn muốn tiếp tục?',
      okText: 'Xóa ngay',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const result = await deleteDanhMuc(id, user.id);
          showSuccessToast("Thành công", result.message);
          setDanhmuc(prev => prev.filter(item => item.id !== id));
        } catch (error) {
          showErrorToast("Lỗi", error.message || "Không thể xóa danh mục.");
        }
      },
    });
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#5d4037", borderRadius: 12 } }}>
      <div className="container-fluid p-4">
        <style>{`
          .category-card { border-radius: 16px; transition: all 0.3s ease; border: 1px solid #f0ece1; height: 100%; }
          .category-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
          .filter-bar { background: #fff; padding: 20px; border-radius: 16px; border: 1px solid #f0ece1; margin-bottom: 24px; }
          .ant-card-actions { background: #fdfcf8 !important; border-top: 1px solid #f0ece1 !important; }
        `}</style>

        {/* Header Section */}
        <Row className="mb-4 align-items-center" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Breadcrumb items={[{ title: 'Quản lý' }, { title: 'Cửa hàng' }, { title: 'Danh mục' }]} className="mb-2" />
            <Title level={3} className="m-0"><AppstoreOutlined /> Quản lý Danh mục</Title>
          </Col>
          <Col xs={24} md={12} className="text-md-end">
            {user?.role === "admin" && (
              <Button 
                type="primary" 
                size="large" 
                icon={<PlusOutlined />} 
                onClick={() => navigate("/danh-muc/them")}
              >
                Thêm danh mục mới
              </Button>
            )}
          </Col>
        </Row>

        {/* Filter Bar */}
        <div className="filter-bar">
          <Row gutter={16}>
            <Col xs={24} md={10} lg={8}>
              <Text strong><SearchOutlined /> Tìm kiếm</Text>
              <Input 
                placeholder="Nhập tên danh mục..." 
                className="mt-2" 
                size="large"
                allowClear
                value={filters.keyword}
                onChange={handleSearchChange}
              />
            </Col>
            <Col xs={24} md={8} lg={6}>
              <Text strong><FilterOutlined /> Trạng thái</Text>
              <Select 
                className="w-100 mt-2" 
                size="large"
                placeholder="Lọc theo trạng thái"
                value={filters.status}
                onChange={handleStatusChange}
              >
                <Select.Option value="">Tất cả trạng thái</Select.Option>
                <Select.Option value="active">Đang kích hoạt</Select.Option>
                <Select.Option value="inactive">Tạm ngưng</Select.Option>
              </Select>
            </Col>
          </Row>
        </div>

        {/* Content Section */}
        <Spin spinning={loading} tip="Đang tải dữ liệu...">
          {danhmuc.length > 0 ? (
            <Row gutter={[24, 24]}>
              {danhmuc.map((item) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                  <Card
                    className="category-card"
                    actions={user?.role === "admin" ? [
                      <Tooltip title="Chỉnh sửa">
                        <EditOutlined key="edit" style={{ color: '#c19a6b' }} onClick={() => navigate(`/danh-muc/sua/${item.id}`)} />
                      </Tooltip>,
                      <Tooltip title="Xóa danh mục">
                        <DeleteOutlined key="delete" style={{ color: '#ff4d4f' }} onClick={() => showDeleteConfirm(item.id)} />
                      </Tooltip>
                    ] : []}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Tag color={item.status === "active" ? "green" : "red"}>
                        {item.status === "active" ? "KÍCH HOẠT" : "TẠM ẨN"}
                      </Tag>
                      <Text type="secondary" style={{ fontSize: '12px' }}>ID: {item.id}</Text>
                    </div>
                    <Title level={5} className="mb-2">{item.name}</Title>
                    <Paragraph 
                      ellipsis={{ rows: 2 }} 
                      type="secondary" 
                      style={{ height: '44px', marginBottom: 0 }}
                    >
                      {item.description || "Không có mô tả cho danh mục này."}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Card className="category-card py-5">
              <Empty description="Không tìm thấy danh mục nào phù hợp" />
            </Card>
          )}

          {/* Pagination Section */}
          <Divider />
          <Row className="align-items-center mb-5">
            <Col xs={24} md={12}>
              <Text type="secondary">Tìm thấy <b>{totalDanhMuc}</b> danh mục tổng cộng</Text>
            </Col>
            <Col xs={24} md={12} className="text-md-end mt-3 mt-md-0">
              <Pagination 
                current={filters.page}
                pageSize={filters.limit}
                total={totalDanhMuc}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </Col>
          </Row>
        </Spin>
      </div>
    </ConfigProvider>
  );
};

export default DsDanhMuc;