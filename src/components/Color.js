import React, { useEffect, useState } from "react";
import { 
  Table, Button, Modal, Form, Input, Row, Col, 
  Tag, Space, Tooltip, ColorPicker, Typography, 
  ConfigProvider, Card, Breadcrumb, Empty ,Divider, Select
} from "antd";
import { 
  PlusOutlined, FileExcelOutlined, EditOutlined, 
  DeleteOutlined, ExclamationCircleOutlined, 
  BgColorsOutlined 
} from "@ant-design/icons";
import {
  getColors,
  createColor,
  updateColor,
  deleteColor,
  getAllColors,
} from "../api/colorApi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";
import { useAuth } from "../contexts/AuthContext";

const { Title, Text } = Typography;
const { confirm } = Modal;

const Color = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const token = localStorage.getItem("token");
  const limit = 10;

  const fetchColors = async () => {
    try {
      setLoading(true);
      const response = await getColors(token, page, limit);
      // Giả định cấu trúc data trả về từ API của bạn
      setColors(response.data.data);
      setTotalItems(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      showErrorToast("Lỗi", "Không thể tải danh sách màu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, [page]);

  // ==== Handlers ====
  const handleOpenAdd = () => {
    setEditMode(false);
    setSelectedId(null);
    form.resetFields();
    form.setFieldsValue({ code: "#1677ff", status: "active" });
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
        await updateColor(token, selectedId, values, user.id);
        showSuccessToast("Thành công", "Cập nhật màu sắc hoàn tất!");
      } else {
        await createColor(token, values, user.id);
        showSuccessToast("Thành công", "Thêm màu sắc mới thành công!");
      }
      setShowModal(false);
      fetchColors();
    } catch (error) {
      showErrorToast("Lỗi", "Thao tác thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showDeleteConfirm = (id) => {
    confirm({
      title: 'Xác nhận xóa màu sắc?',
      icon: <ExclamationCircleOutlined />,
      content: 'Dữ liệu màu này sẽ bị loại bỏ khỏi danh sách lựa chọn.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteColor(token, id, user.id);
          showSuccessToast("Thành công", "Đã xóa màu sắc!");
          fetchColors();
        } catch (error) {
          showErrorToast("Lỗi", "Không thể xóa màu này!");
        }
      },
    });
  };

  const handleExport = async () => {
    try {
      const response = await getAllColors(token);
      const data = response.data;
      const exportData = data.map((item, index) => ({
        STT: index + 1,
        "Tên màu": item.name,
        "Mã Hex": item.code,
        "Trạng thái": item.status === "active" ? "Hiển thị" : "Ẩn",
        "Ngày tạo": item.created_at,
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Colors");
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, "danh-sach-mau.xlsx");
    } catch (error) {
      showErrorToast("Lỗi", "Xuất file Excel thất bại!");
    }
  };

  // ==== Table Columns ====
  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      render: (_, __, index) => (page - 1) * limit + index + 1,
      width: 60,
    },
    {
      title: 'TÊN MÀU SẮC',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'MÃ HEX',
      dataIndex: 'code',
      key: 'code',
      render: (code) => <Text code>{code}</Text>,
    },
    {
      title: 'MÀU HIỂN THỊ',
      dataIndex: 'code',
      key: 'preview',
      render: (code) => (
        <div style={{ 
          width: 40, height: 24, backgroundColor: code, 
          borderRadius: 6, border: '2px solid #fff',
          boxShadow: '0 0 4px rgba(0,0,0,0.1)' 
        }} />
      ),
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? 'ĐANG HIỂN THỊ' : 'TẠM ẨN'}
        </Tag>
      ),
    },
    {
      title: 'NGÀY TẠO',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date?.slice(0, 10),
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: '#c19a6b' }} />} 
              onClick={() => handleOpenEdit(record)}
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
    <ConfigProvider theme={{ token: { colorPrimary: "#5d4037", borderRadius: 12 } }}>
      <div className="container-fluid p-4">
        <style>{`
          .color-card { border-radius: 20px; border: 1px solid #f0ece1; overflow: hidden; }
          .ant-table-thead > tr > th { background: #fdfcf8 !important; }
        `}</style>

        <Row className="mb-4 align-items-center" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Breadcrumb items={[{ title: 'Quản trị' }, { title: 'Cấu hình' }, { title: 'Màu sắc' }]} className="mb-2" />
            <Title level={3} className="m-0"><BgColorsOutlined /> Danh mục Màu sắc</Title>
          </Col>
          <Col xs={24} md={12} className="text-md-end">
            <Space>
              <Button icon={<FileExcelOutlined />} onClick={handleExport} size="large">Xuất Excel</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd} size="large">Thêm màu mới</Button>
            </Space>
          </Col>
        </Row>

        <Card className="color-card border-0 shadow-sm">
          <Table 
            columns={columns} 
            dataSource={colors} 
            rowKey="id"
            loading={loading}
            pagination={{
              current: page,
              pageSize: limit,
              total: totalItems,
              onChange: (p) => setPage(p),
              showSizeChanger: false,
              position: ['bottomRight']
            }}
            locale={{ emptyText: <Empty description="Chưa có dữ liệu màu sắc" /> }}
          />
        </Card>

        {/* Modal Thêm/Sửa */}
        <Modal
          title={<Title level={4}>{editMode ? "Cập nhật màu sắc" : "Tạo màu sắc mới"}</Title>}
          open={showModal}
          onCancel={() => setShowModal(false)}
          footer={null}
          centered
          destroyOnClose
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
            <Form.Item name="name" label="Tên gọi màu sắc" rules={[{ required: true, message: 'Ví dụ: Xanh Navy, Đỏ Đô...' }]}>
              <Input size="large" placeholder="Nhập tên màu..." />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="code" label="Mã màu (Hex)" rules={[{ required: true }]}>
                  <Input size="large" prefix={<div style={{ width: 14, height: 14, borderRadius: 2, background: form.getFieldValue('code') }} />} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Chọn nhanh">
                  <ColorPicker 
                    value={form.getFieldValue('code')}
                    onChange={(color) => form.setFieldsValue({ code: color.toHexString() })}
                    showText
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="status" label="Trạng thái hiển thị">
              <Select size="large">
                <Select.Option value="active">Kích hoạt</Select.Option>
                <Select.Option value="inactive">Tạm ẩn</Select.Option>
              </Select>
            </Form.Item>

            <Divider />
            
            <Form.Item className="mb-0 text-end">
              <Space>
                <Button onClick={() => setShowModal(false)} size="large">Hủy bỏ</Button>
                <Button type="primary" htmlType="submit" size="large" loading={isSubmitting}>
                  {editMode ? "Lưu thay đổi" : "Xác nhận thêm"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default Color;