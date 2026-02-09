import React, { useEffect, useState } from "react";
import { 
  Table, Button, Modal, Form, Input, Row, Col, 
  Tag, Space, Tooltip, Typography, ConfigProvider, 
  Card, Breadcrumb, Empty, Select, Divider 
} from "antd";
import { 
  PlusOutlined, FileExcelOutlined, EditOutlined, 
  DeleteOutlined, ExclamationCircleOutlined, 
  ColumnHeightOutlined 
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  getSizes,
  createSize,
  updateSize,
  deleteSize,
  getAllSizes,
} from "../api/sizeApi";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const { Title, Text } = Typography;
const { confirm } = Modal;

const Size = () => {
  const token = localStorage.getItem("token");
  const [form] = Form.useForm();
  
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const limit = 10;

  const fetchSizes = async () => {
    try {
      setLoading(true);
      const res = await getSizes(token, currentPage, limit);
      // Giả định API trả về { data: { data: [], total: 100 } }
      setSizes(res.data.data);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      showErrorToast("Lỗi", "Không thể tải danh sách kích cỡ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSizes();
  }, [currentPage]);

  // ==== Xử lý Modal ====
  const handleOpenAdd = () => {
    setEditMode(false);
    setSelectedId(null);
    form.resetFields();
    form.setFieldsValue({ active: "active" });
    setShowModal(true);
  };

  const handleOpenEdit = (record) => {
    setEditMode(true);
    setSelectedId(record.id);
    form.setFieldsValue(record);
    setShowModal(true);
  };

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      if (editMode) {
        await updateSize(token, selectedId, values);
        showSuccessToast("Thành công", "Cập nhật kích cỡ hoàn tất!");
      } else {
        await createSize(token, values);
        showSuccessToast("Thành công", "Thêm kích cỡ mới thành công!");
      }
      setShowModal(false);
      fetchSizes();
    } catch (err) {
      showErrorToast("Thất bại", "Thao tác không thành công.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showDeleteConfirm = (id) => {
    confirm({
      title: 'Xác nhận xóa kích cỡ?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác. Các sản phẩm đang dùng size này có thể bị ảnh hưởng.',
      okText: 'Xóa ngay',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteSize(token, id);
          showSuccessToast("Thành công", "Đã xóa kích cỡ!");
          fetchSizes();
        } catch (error) {
          showErrorToast("Lỗi", "Không thể xóa dữ liệu này.");
        }
      },
    });
  };

  const handleExport = async () => {
    try {
      const response = await getAllSizes(token);
      const data = response.data;
      const exportData = data.map((item, index) => ({
        STT: index + 1,
        "Tên Size": item.name,
        "Trạng thái": item.active === "active" ? "Hiển thị" : "Ẩn",
        "Ngày tạo": new Date(item.created_at).toLocaleDateString("vi-VN"),
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sizes");
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, "danh-sach-size.xlsx");
    } catch (error) {
      showErrorToast("Lỗi", "Xuất file thất bại.");
    }
  };

  // ==== Cấu hình bảng ====
  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 80,
      align: 'center',
      render: (_, __, index) => (currentPage - 1) * limit + index + 1,
    },
    {
      title: 'TÊN KÍCH CỠ / HÌNH DẠNG',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong style={{ fontSize: '15px' }}>{text}</Text>,
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'active',
      key: 'active',
      align: 'center',
      render: (status) => (
        <Tag color={status === 'active' ? 'blue' : 'default'} style={{ borderRadius: '4px', padding: '0 10px' }}>
          {status === 'active' ? 'ĐANG HIỆN' : 'TẠM ẨN'}
        </Tag>
      ),
    },
    {
      title: 'NGÀY KHỞI TẠO',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'action',
      align: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: '#c19a6b' }} />} 
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa dữ liệu">
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
    <ConfigProvider theme={{ token: { colorPrimary: "#5d4037", borderRadius: 10 } }}>
      <div className="container-fluid p-4">
        <style>{`
          .size-card { border-radius: 16px; border: 1px solid #f0ece1; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
          .ant-table-thead > tr > th { background: #fdfcf8 !important; font-weight: 600; text-transform: uppercase; font-size: 12px; }
        `}</style>

        {/* Header & Actions */}
        <Row className="mb-4 align-items-center" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Breadcrumb items={[{ title: 'Hệ thống' }, { title: 'Thuộc tính' }, { title: 'Size' }]} className="mb-2" />
            <Title level={3} className="m-0"><ColumnHeightOutlined /> Quản lý Kích cỡ</Title>
          </Col>
          <Col xs={24} md={12} className="text-md-end">
            <Space size="middle">
              <Button icon={<FileExcelOutlined />} onClick={handleExport} size="large">Xuất báo cáo</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd} size="large">Thêm Size mới</Button>
            </Space>
          </Col>
        </Row>

        {/* Bảng dữ liệu */}
        <Card className="size-card border-0">
          <Table 
            columns={columns} 
            dataSource={sizes} 
            rowKey="id"
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: limit,
              total: totalItems,
              onChange: (p) => setCurrentPage(p),
              showSizeChanger: false,
              position: ['bottomRight']
            }}
            locale={{ emptyText: <Empty description="Chưa có thông tin về kích cỡ" /> }}
          />
        </Card>

        {/* Modal Form */}
        <Modal
          title={<Title level={4} className="m-0">{editMode ? "Chỉnh sửa kích cỡ" : "Tạo kích cỡ mới"}</Title>}
          open={showModal}
          onCancel={() => setShowModal(false)}
          footer={null}
          centered
          destroyOnClose
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
            <Form.Item 
              name="name" 
              label={<Text strong>Tên kích cỡ / Phân loại</Text>} 
              rules={[{ required: true, message: 'Vui lòng nhập tên (Ví dụ: XL, 42, Lớn...)' }]}
            >
              <Input size="large" placeholder="Nhập tên size..." />
            </Form.Item>

            <Form.Item 
              name="active" 
              label={<Text strong>Trạng thái kinh doanh</Text>}
            >
              <Select size="large">
                <Select.Option value="active">Hiển thị (Active)</Select.Option>
                <Select.Option value="inactive">Tạm ẩn (Inactive)</Select.Option>
              </Select>
            </Form.Item>

            <Divider />

            <Form.Item className="mb-0 text-end">
              <Space>
                <Button onClick={() => setShowModal(false)} size="large">Hủy</Button>
                <Button type="primary" htmlType="submit" size="large" loading={isSubmitting}>
                  {editMode ? "Lưu cập nhật" : "Tạo ngay"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default Size;