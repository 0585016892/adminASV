import React, { useEffect, useState, useCallback } from "react";
import { 
  Table, Card, Button, Input, Select, Space, Modal, 
  Tag, Typography, Breadcrumb, Row, Col, Tooltip, 
  Popconfirm, Form, Badge, Empty 
} from "antd";
import { 
  PlusOutlined, SearchOutlined, EditOutlined, 
  DeleteOutlined, FileExcelOutlined, FolderAddOutlined,
  LinkOutlined, PhoneOutlined, MailOutlined, HomeOutlined,
  DownOutlined, RightOutlined
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  getFooters,
  deleteFooterById,
  updateFooterStatus,
  addFooterChild,
} from "../api/footerApi";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const { Title, Text } = Typography;

const FooterList = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [footers, setFooters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ page: 1, limit: 12, keyword: "" });
  const [total, setTotal] = useState(0);

  // Modal State
  const [isAddChildVisible, setIsAddChildVisible] = useState(false);
  const [currentParentId, setCurrentParentId] = useState(null);

  const fetchFooters = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFooters(filters);
      // Ant Design Table cần field 'key', dùng 'id' để thay thế
      const mappedData = data.footers.map(f => ({ ...f, key: f.id }));
      setFooters(mappedData);
      setTotal(data.totalFooters);
    } catch (err) {
      showErrorToast("Lỗi", "Không thể tải danh sách footer");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFooters();
  }, [fetchFooters]);

  // Xử lý Export Excel
  const handleExport = () => {
    const dataToExport = footers.map((f) => ({
      ID: `FOO0${f.id}`,
      "Tiêu đề": f.title,
      "Liên kết/Giá trị": f.label,
      "Loại": f.type,
      "Trạng thái": f.status === "active" ? "Hoạt động" : "Ẩn",
      "Ngày tạo": new Date(f.created_at).toLocaleDateString("vi-VN"),
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Footers");
    XLSX.writeFile(wb, "Danh_sach_Footer.xlsx");
  };

  // Cập nhật trạng thái nhanh
  const onStatusChange = async (id, status) => {
    try {
      await updateFooterStatus(id, status);
      showSuccessToast("Thành công", "Đã cập nhật trạng thái");
      fetchFooters();
    } catch {
      showErrorToast("Lỗi", "Không thể cập nhật trạng thái");
    }
  };

  // Thêm danh mục con
  const handleAddChild = async (values) => {
    try {
      await addFooterChild({ ...values, parent_id: currentParentId });
      showSuccessToast("Thành công", "Đã thêm danh mục con");
      setIsAddChildVisible(false);
      form.resetFields();
      fetchFooters();
    } catch {
      showErrorToast("Lỗi", "Không thể thêm danh mục con");
    }
  };

  const columns = [
    {
      title: 'MÃ',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id, record) => (
        <Text type="secondary">{record.parent_id ? `↳ FO0${id}` : `FOO0${id}`}</Text>
      ),
    },
    {
      title: 'TIÊU ĐỀ',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Text strong={!record.parent_id}>{text}</Text>
      ),
    },
    {
      title: 'LIÊN KẾT / GIÁ TRỊ',
      dataIndex: 'label',
      key: 'label',
      render: (label, record) => {
        if (!label) return <Text type="secondary">—</Text>;
        const icons = {
          phone: <PhoneOutlined />,
          email: <MailOutlined />,
          address: <HomeOutlined />,
          link: <LinkOutlined />
        };
        return (
          <Space>
            {icons[record.value] || icons.link}
            <Text ellipsis style={{ maxWidth: 200 }}>{label}</Text>
          </Space>
        );
      }
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status, record) => (
        <Select 
          size="small" 
          value={status} 
          style={{ width: 120 }}
          onChange={(val) => onStatusChange(record.id, val)}
        >
          <Select.Option value="active"><Tag color="success">Hoạt động</Tag></Select.Option>
          <Select.Option value="inactive"><Tag color="default">Tạm ẩn</Tag></Select.Option>
        </Select>
      ),
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      align: 'right',
      render: (record) => (
        <Space>
          {!record.parent_id && record.type === "group" && (
            <Tooltip title="Thêm mục con">
              <Button 
                icon={<FolderAddOutlined />} 
                size="small" 
                onClick={() => {
                  setCurrentParentId(record.id);
                  setIsAddChildVisible(true);
                }}
              />
            </Tooltip>
          )}
          <Tooltip title="Sửa">
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => navigate(`/footers/edit/${record.id}`)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa footer này?"
            description="Lưu ý: Các mục con cũng sẽ bị ảnh hưởng."
            onConfirm={() => deleteFooterById(record.id).then(fetchFooters)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-4">
        <Breadcrumb items={[{ title: 'Hệ thống' }, { title: 'Cấu hình Footer' }]} />
        <Row justify="space-between" align="middle" style={{ marginTop: 12 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>📜 Quản lý Footer Website</Title>
          </Col>
          <Col>
            <Space>
              <Button icon={<FileExcelOutlined />} onClick={handleExport}>Xuất Excel</Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                style={{ background: '#5d4037', borderColor: '#5d4037' }}
                onClick={() => navigate("/footers/create")}
              >
                Thêm Footer chính
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Filter Bar */}
      <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: 12 }}>
        <Input 
          prefix={<SearchOutlined />} 
          placeholder="Tìm nhanh theo tiêu đề footer..." 
          size="large"
          allowClear
          style={{ maxWidth: 400 }}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value, page: 1 })}
        />
      </Card>

      {/* Main Table */}
      <Card className="shadow-sm border-0" style={{ borderRadius: 16 }}>
        <Table 
          columns={columns} 
          dataSource={footers.filter(f => !f.parent_id)} // Chỉ hiện cha ở ngoài cùng
          loading={loading}
          expandable={{
            // Tự động lấy children từ data
            expandedRowRender: (record) => (
              <Table 
                columns={columns} 
                dataSource={record.children || []} 
                pagination={false} 
                size="small"
                bordered
                showHeader={false}
                rowKey="id"
              />
            ),
            rowExpandable: (record) => record.children?.length > 0 || record.type === "group",
            expandIcon: ({ expanded, onExpand, record }) =>
              record.type === "group" ? (
                expanded ? (
                  <DownOutlined onClick={e => onExpand(record, e)} style={{ marginRight: 8 }} />
                ) : (
                  <RightOutlined onClick={e => onExpand(record, e)} style={{ marginRight: 8 }} />
                )
              ) : <span style={{ marginRight: 22 }} />
          }}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: total,
            onChange: (page) => setFilters({ ...filters, page })
          }}
        />
      </Card>

      {/* Modal Thêm Con */}
      <Modal
        title={`➕ Thêm mục con vào nhóm [ID: ${currentParentId}]`}
        open={isAddChildVisible}
        onCancel={() => setIsAddChildVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddChild}>
          <Form.Item name="title" label="Tiêu đề hiển thị" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Chính sách bảo mật" />
          </Form.Item>
          <Form.Item name="label" label="Đường dẫn / Nội dung" rules={[{ required: true }]}>
            <Input placeholder="URL hoặc số điện thoại..." />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="value" label="Loại dữ liệu" rules={[{ required: true }]}>
                <Select placeholder="Chọn loại">
                  <Select.Option value="link">Đường dẫn (Link)</Select.Option>
                  <Select.Option value="phone">Số điện thoại</Select.Option>
                  <Select.Option value="email">Email</Select.Option>
                  <Select.Option value="text">Văn bản thuần</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái" initialValue="active">
                <Select>
                  <Select.Option value="active">Hiển thị</Select.Option>
                  <Select.Option value="inactive">Ẩn</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="type" initialValue="link" hidden><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FooterList;