import React, { useEffect, useState, useRef, useCallback } from "react";
// Sửa lại dòng này
import { 
  Table, Card, Button, Select, Tag, Rate, Space, Typography, 
  Modal, Image, Row, Col, Badge, Empty, Spin, Tooltip, Avatar,
  Popconfirm // <--- Thêm vào đây,
} from "antd";
import { 
  StarFilled, 
  CheckCircleOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  MessageOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import reviewApi from "../api/reviewApi";
import { io } from "socket.io-client";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const { Title, Text,Paragraph } = Typography;
const URL_WEB = process.env.REACT_APP_WEB_URL;

const AdminReviews = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ rating: "", status: "all" });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  
  const [showProductModal, setShowProductModal] = useState(false);
  const [productReviews, setProductReviews] = useState([]);
  const [currentProductName, setCurrentProductName] = useState("");
  const socketRef = useRef(null);

  // 1. Khởi tạo Socket.io
  useEffect(() => {
    socketRef.current = io(URL_WEB);
    const refreshData = () => loadProducts(pagination.page);

    socketRef.current.on("newReview", refreshData);
    socketRef.current.on("approveReview", refreshData);
    socketRef.current.on("reviewDeleted", refreshData);

    return () => socketRef.current.disconnect();
  }, [pagination.page]);

  // 2. Load sản phẩm theo filter
  const loadProducts = useCallback(async (page) => {
    setLoading(true);
    try {
      const res = await reviewApi.getAllReviews({
        page,
        limit: pagination.limit,
        rating: filters.rating,
      });
      setProducts(res.data || []);
      setPagination(prev => ({ ...prev, total: res.pagination?.total || 0, page }));
    } catch (err) {
      showErrorToast("Lỗi", "Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  useEffect(() => {
    loadProducts(1);
  }, [loadProducts]);

  // 3. Xử lý Duyệt/Xóa
  const handleApprove = async (id) => {
    try {
      await reviewApi.approveReview(id);
      socketRef.current.emit("approveReview", id);
      setProductReviews(prev => prev.map(rv => rv.id === id ? { ...rv, is_verified: 1 } : rv));
      showSuccessToast("Thành công", "Đã duyệt đánh giá");
      loadProducts(pagination.page);
    } catch (err) {
      showErrorToast("Lỗi", "Duyệt đánh giá thất bại");
    }
  };

  const handleDelete = async (id) => {
    try {
      await reviewApi.deleteReview(id);
      socketRef.current.emit("reviewDeleted", id);
      setProductReviews(prev => prev.filter(rv => rv.id !== id));
      showSuccessToast("Thành công", "Đã xóa đánh giá");
      loadProducts(pagination.page);
    } catch (err) {
      showErrorToast("Lỗi", "Xóa đánh giá thất bại");
    }
  };

  // 4. Chi tiết đánh giá sản phẩm
  const viewDetails = async (productId, name) => {
    try {
      const res = await reviewApi.getAllReviews({ productId, limit: 50 });
      const parsed = (res.data || []).map(rv => ({
        ...rv,
        images: typeof rv.images === 'string' ? JSON.parse(rv.images) : (rv.images || [])
      }));
      setProductReviews(parsed);
      setCurrentProductName(name);
      setShowProductModal(true);
    } catch (err) {
      showErrorToast("Lỗi", "Không thể lấy chi tiết");
    }
  };

  const columns = [
    {
      title: 'SẢN PHẨM',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: '#5d4037' }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>ID: {record.product_id}</Text>
        </Space>
      ),
    },
    {
      title: 'CHỈ SỐ SAO',
      dataIndex: 'avg_rating',
      key: 'avg_rating',
      render: (val) => (
        <Space>
          <Rate disabled defaultValue={val} allowHalf style={{ fontSize: 14 }} />
          <Text type="warning" strong>{Number(val).toFixed(1)}</Text>
        </Space>
      ),
    },
    {
      title: 'PHẢN HỒI',
      key: 'count',
      render: (record) => (
        <Space size="large">
          <Badge count={record.total_reviews} showZero color="#5d4037" title="Tổng số" />
          {record.pending_reviews > 0 && (
            <Tooltip title="Cần duyệt gấp">
              <Badge count={record.pending_reviews} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'MỚI NHẤT',
      dataIndex: 'last_review_date',
      key: 'last_review_date',
      render: (date) => date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: 'QUẢN LÝ',
      key: 'action',
      align: 'right',
      render: (record) => (
        <Button 
          type="primary" 
          ghost 
          icon={<EyeOutlined />} 
          onClick={() => viewDetails(record.product_id, record.product_name)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <Title level={3}><MessageOutlined /> Phản hồi khách hàng</Title>
      
      {/* Bộ lọc */}
      <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: 12 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Text type="secondary">Lọc theo số sao</Text>
            <Select 
              className="w-100 mt-1" 
              placeholder="Tất cả mức sao"
              onChange={(val) => setFilters(prev => ({ ...prev, rating: val }))}
              allowClear
            >
              {[5, 4, 3, 2, 1].map(s => <Select.Option key={s} value={s}>{s} Sao</Select.Option>)}
            </Select>
          </Col>
          <Col span={6}>
            <Text type="secondary">Tình trạng duyệt</Text>
            <Select 
              className="w-100 mt-1" 
              defaultValue="all"
              onChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
            >
              <Select.Option value="all">Tất cả đánh giá</Select.Option>
              <Select.Option value="pending">Chờ phê duyệt</Select.Option>
              <Select.Option value="done">Đã duyệt hoàn tất</Select.Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Bảng chính */}
      <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
        <Table 
          columns={columns} 
          dataSource={products.filter(p => {
            if (filters.status === "pending") return p.pending_reviews > 0;
            if (filters.status === "done") return p.pending_reviews === 0;
            return true;
          })} 
          loading={loading}
          rowKey="product_id"
          pagination={{
            current: pagination.page,
            total: pagination.total,
            pageSize: pagination.limit,
            onChange: (page) => loadProducts(page)
          }}
        />
      </Card>

      {/* Modal chi tiết đánh giá */}
      <Modal
        title={<Title level={4}>Đánh giá sản phẩm: {currentProductName}</Title>}
        open={showProductModal}
        onCancel={() => setShowProductModal(false)}
        width={1000}
        footer={null}
      >
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {productReviews.map((rv) => (
            <Card key={rv.id} className="mb-3 border-light shadow-sm">
              <Row gutter={16}>
                <Col span={6}>
                  <Space align="start">
                    <Avatar size="large" style={{ backgroundColor: '#5d4037' }}>
                      {rv.full_name?.charAt(0)}
                    </Avatar>
                    <div style={{ lineHeight: 1.2 }}>
                      <Text strong block>{rv.full_name}</Text>
                      <Text type="secondary" size="small">{rv.phone}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        <ClockCircleOutlined /> {new Date(rv.created_at).toLocaleString("vi-VN")}
                      </Text>
                    </div>
                  </Space>
                </Col>
                <Col span={12}>
                  <Rate disabled defaultValue={rv.rating} style={{ fontSize: 12, marginBottom: 8 }} />
                  <Paragraph style={{ whiteSpace: 'pre-wrap', color: '#444' }}>{rv.content}</Paragraph>
                  <Space wrap>
                    {rv.images.map((img, i) => (
                      <Image
                        key={i}
                        src={`${URL_WEB}/uploads/reviews/${img}`}
                        width={80}
                        height={80}
                        style={{ objectFit: 'cover', borderRadius: 8 }}
                      />
                    ))}
                  </Space>
                </Col>
                <Col span={6} className="text-end">
                  <Space direction="vertical">
                    {rv.is_verified ? (
                      <Tag color="success" icon={<CheckCircleOutlined />}>Đã duyệt</Tag>
                    ) : (
                      <Button 
                        type="primary" 
                        size="small" 
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleApprove(rv.id)}
                      >
                        Duyệt ngay
                      </Button>
                    )}
                    <Popconfirm
                      title="Xóa đánh giá này?"
                      icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                      onConfirm={() => handleDelete(rv.id)}
                    >
                      <Button danger size="small" icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                  </Space>
                </Col>
              </Row>
            </Card>
          ))}
          {productReviews.length === 0 && <Empty />}
        </div>
      </Modal>
    </div>
  );
};

export default AdminReviews;