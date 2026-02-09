import React, { useEffect, useState, useCallback } from "react";
import { 
  Table, Card, Button, Input, Select, Space, Modal, 
  Tag, Typography, Breadcrumb, Row, Col, Tooltip, 
  Popconfirm, Badge, Empty 
} from "antd";
import { 
  PlusOutlined, SearchOutlined, EditOutlined, 
  DeleteOutlined, EyeOutlined, BookOutlined,
  CheckCircleOutlined, StopOutlined, FilterOutlined
} from "@ant-design/icons";
import { filterPosts, deletePost, updatePostStatus } from "../api/postAPI";
import { PostModal, PostDetailModal } from "../components";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const { Title, Text } = Typography;

const DanhSachBaiViet = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ keyword: "", page: 1, limit: 6 });
  const [total, setTotal] = useState(0);
  
  // States cho Modals
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await filterPosts(filters);
      setPosts(Array.isArray(data.posts) ? data.posts : []);
      setTotal(data.totalPosts || 0);
    } catch (err) {
      showErrorToast("Lỗi", "Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    try {
      await deletePost(id);
      showSuccessToast("Thành công", "Đã xóa bài viết");
      fetchData();
    } catch (err) {
      showErrorToast("Lỗi", "Không thể xóa bài viết");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updatePostStatus(id, newStatus);
      showSuccessToast("Cập nhật", "Đã thay đổi trạng thái bài viết");
      fetchData();
    } catch (err) {
      showErrorToast("Lỗi", "Cập nhật trạng thái thất bại");
    }
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 70,
      render: (_, __, index) => (filters.page - 1) * filters.limit + index + 1,
    },
    {
      title: 'TIÊU ĐỀ BÀI VIẾT',
      dataIndex: 'title',
      key: 'title',
      render: (text) => (
        <Text strong style={{ color: '#5d4037' }}>{text}</Text>
      ),
    },
    {
      title: 'DANH MỤC',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => cat ? <Tag color="orange">{cat}</Tag> : <Text type="secondary">Chưa phân loại</Text>,
    },
    {
      title: 'TRẠNG THÁI',
      key: 'status',
      width: 180,
      render: (record) => (
        <Select
          value={record.status}
          onChange={(val) => handleStatusChange(record.id, val)}
          style={{ width: 140 }}
          bordered={false}
          className={`status-select ${record.status}`}
        >
          <Select.Option value="published">
            <Tag icon={<CheckCircleOutlined />} color="success">Hiển thị</Tag>
          </Select.Option>
          <Select.Option value="draft">
            <Tag icon={<StopOutlined />} color="default">Bản nháp</Tag>
          </Select.Option>
        </Select>
      ),
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      align: 'right',
      render: (record) => (
        <Space>
          <Tooltip title="Xem nhanh">
            <Button 
              icon={<EyeOutlined />} 
              shape="circle" 
              onClick={() => {
                setSelectedPost(record);
                setShowDetailModal(true);
              }} 
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa nội dung">
            <Button 
              icon={<EditOutlined />} 
              shape="circle" 
              onClick={() => {
                setEditData(record);
                setShowModalAdd(true);
              }} 
            />
          </Tooltip>
          <Popconfirm
            title="Xóa bài viết này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<DeleteOutlined />} danger shape="circle" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header Section */}
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <Breadcrumb items={[{ title: 'Nội dung' }, { title: 'Tin tức & Blog' }]} />
          <Title level={3} style={{ marginTop: 8 }}><BookOutlined /> Quản lý bài viết</Title>
        </Col>
        <Col>
          <Button 
            type="primary" 
            size="large" 
            icon={<PlusOutlined />} 
            style={{ background: '#5d4037', borderColor: '#5d4037', borderRadius: 8 }}
            onClick={() => {
              setEditData(null);
              setShowModalAdd(true);
            }}
          >
            Viết bài mới
          </Button>
        </Col>
      </Row>

      {/* Filters Card */}
      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} md={12} lg={8}>
            <Input 
              prefix={<SearchOutlined />} 
              placeholder="Tìm theo tiêu đề hoặc danh mục..." 
              size="large"
              allowClear
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value, page: 1 })}
            />
          </Col>
          <Col>
            <Text type="secondary"><FilterOutlined /> Đang hiển thị {posts.length} / {total} kết quả</Text>
          </Col>
        </Row>
      </Card>

      {/* Table Section */}
      <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
        <Table 
          columns={columns} 
          dataSource={posts} 
          loading={loading}
          rowKey="id"
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: total,
            onChange: (page) => setFilters({ ...filters, page }),
            showSizeChanger: false,
            position: ['bottomRight']
          }}
          locale={{ emptyText: <Empty description="Không tìm thấy bài viết nào" /> }}
        />
      </Card>

      {/* Modals kế thừa từ components cũ của bạn nhưng tương thích Antd */}
      <PostModal
        show={showModalAdd}
        onHide={() => setShowModalAdd(false)}
        initialData={editData}
        onSuccess={fetchData}
      />

      <PostDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        post={selectedPost}
      />
    </div>
  );
};

export default DanhSachBaiViet;