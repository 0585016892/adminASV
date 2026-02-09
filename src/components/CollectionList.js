import React, { useState, useEffect } from "react";
import { 
  Table, Input, Select, Button, Tag, Typography, 
  Space, Spin, Breadcrumb, ConfigProvider, Tooltip, 
  Avatar, Modal, Badge
} from "antd";
import { 
  SearchOutlined, PlusOutlined, EditOutlined, 
  DeleteOutlined, ExclamationCircleOutlined, 
  FolderOpenOutlined, FilterOutlined, 
  CalendarOutlined, PictureOutlined
} from "@ant-design/icons";
import CollectionModal from "./CollectionModal";
import {
  createCollection,
  updateCollection,
  deleteCollection,
  getCollections,
} from "../api/collectionApi";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const { Title, Text } = Typography;
const { confirm } = Modal;

const CollectionList = () => {
  const [collections, setCollections] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await getCollections({
        search,
        status: statusFilter,
        page,
        limit: 10, // Danh sách bảng nên để 10-15 dòng
      });
      setCollections(res.data);
      setTotalItems(res.total || 0);
    } catch (err) {
      showErrorToast("Lỗi", "Không thể tải danh sách.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [search, statusFilter, page]);

  const showDeleteConfirm = (id) => {
    confirm({
      title: 'Xác nhận xóa bộ sưu tập?',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: 'Dữ liệu liên quan sẽ bị ảnh hưởng. Bạn chắc chắn chứ?',
      okText: 'Xóa dữ liệu',
      okType: 'danger',
      cancelText: 'Hủy bỏ',
      onOk: async () => {
        try {
          await deleteCollection(id);
          showSuccessToast("Thành công", "Đã xóa bộ sưu tập");
          fetchCollections();
        } catch (error) {
          showErrorToast("Thất bại", "Lỗi khi xóa.");
        }
      },
    });
  };

  const columns = [
    {
      title: 'HÌNH ẢNH',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image, record) => (
        <Badge dot={record.status === 'active'} offset={[-5, 35]} color="#52c41a">
          <Avatar 
            shape="rounded" 
            size={54} 
            src={image?.startsWith("http") ? image : `${process.env.REACT_APP_WEB_URL}/uploads/${image}`}
            icon={<PictureOutlined />}
            className="border shadow-sm"
          />
        </Badge>
      ),
    },
   {
  title: 'THÔNG TIN BỘ SƯU TẬP',
  key: 'info',
  width: 350, // Cố định chiều rộng cột
  render: (_, record) => (
    <Space direction="vertical" size={0} style={{ width: '100%' }}>
      {/* Tiêu đề: Giới hạn trên 1 dòng */}
      <Tooltip title={record.name} placement="topLeft">
        <Text strong style={{ 
          fontSize: '15px', 
          display: 'block',
          width: '280px' 
        }} ellipsis>
          {record.name}
        </Text>
      </Tooltip>
      
      {/* Mô tả: Giới hạn trên 1 dòng màu nhạt hơn */}
      <Text type="secondary" style={{ fontSize: '13px', width: '280px' }} ellipsis>
        {record.description || "Chưa có mô tả..."}
      </Text>
    </Space>
  ),
},
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      align: 'center',
      render: (status) => (
        <Tag color={status === 'active' ? 'processing' : 'default'} style={{ borderRadius: '20px', padding: '0 12px' }}>
          {status === 'active' ? 'Đang hiển thị' : 'Đang ẩn'}
        </Tag>
      ),
    },
    {
      title: 'NGÀY TẠO',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date) => (
        <Text type="secondary">
          <CalendarOutlined style={{ marginRight: 6 }} />
          {date ? new Date(date).toLocaleDateString('vi-VN') : '---'}
        </Text>
      )
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'actions',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: '#5d4037' }} />} 
              onClick={() => { setEditItem(record); setShowModal(true); }}
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
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#5d4037", borderRadius: 8 } }}>
      <div className="p-4 bg-light min-vh-100">
        <style>{`
          .modern-table .ant-table-thead > tr > th { background: #fdfcf8; font-size: 12px; font-weight: 700; text-transform: uppercase; }
          .modern-table .ant-table-tbody > tr:hover > td { background: #fdfcf8 !important; }
          .search-bar { background: white; padding: 20px; border-radius: 12px; border: 1px solid #f0ece1; margin-bottom: 20px; }
        `}</style>

        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Breadcrumb items={[{ title: "Quản trị" }, { title: "Bộ sưu tập" }]} className="mb-2" />
            <Title level={3} className="m-0"><FolderOpenOutlined /> Danh sách Bộ sưu tập</Title>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            onClick={() => { setEditItem(null); setShowModal(true); }}
            style={{ fontWeight: 600 }}
          >
            Khởi tạo mới
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="search-bar shadow-sm">
          <Space size="large" wrap>
            <div style={{ width: 300 }}>
              <Text strong small>Tìm kiếm</Text>
              <Input 
                prefix={<SearchOutlined />} 
                placeholder="Tên bộ sưu tập..." 
                className="mt-1" 
                size="large"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ width: 200 }}>
              <Text strong small>Trạng thái</Text>
              <Select 
                className="w-100 mt-1" 
                size="large" 
                placeholder="Chọn trạng thái"
                value={statusFilter}
                onChange={v => setStatusFilter(v)}
                options={[
                  { label: 'Tất cả', value: '' },
                  { label: 'Đang hoạt động', value: 'active' },
                  { label: 'Tạm ẩn', value: 'inactive' },
                ]}
              />
            </div>
          </Space>
        </div>

        {/* Table Section */}
        <div className="bg-white p-3 rounded-4 border shadow-sm">
          <Table 
            className="modern-table"
            columns={columns} 
            dataSource={collections} 
            rowKey="id"
            loading={loading}
            pagination={{
              current: page,
              total: totalItems,
              pageSize: 10,
              onChange: (p) => setPage(p),
              position: ['bottomCenter'],
              showSizeChanger: false
            }}
          />
        </div>

        <CollectionModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onSave={fetchCollections}
          initialData={editItem}
        />
      </div>
    </ConfigProvider>
  );
};

export default CollectionList;