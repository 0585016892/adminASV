import React, { useEffect, useState, useCallback } from "react";
import { 
  Table, Card, Button, Input, Select, Space, Modal, 
  Tag, Typography, Breadcrumb, Row, Col, Image, 
  Tooltip, Popconfirm, Empty 
} from "antd";
import { 
  PlusOutlined, SearchOutlined, EditOutlined, 
  DeleteOutlined, FileExcelOutlined, PictureOutlined,
  EyeOutlined, SwapOutlined
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { getSlides, deleteSlideById, updateSlideStatus } from "../api/slideApi";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const { Title, Text } = Typography;
const URL_WEB = process.env.REACT_APP_WEB_URL;

const SlideList = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ page: 1, limit: 8, keyword: "" });
  const [total, setTotal] = useState(0);

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSlides(filters);
      setSlides(data.slides);
      setTotal(data.totalSlides);
    } catch (err) {
      showErrorToast("Lỗi", "Không thể tải danh sách slide");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const handleDelete = async (id) => {
    try {
      await deleteSlideById(id);
      showSuccessToast("Thành công", "Đã xóa slide khỏi hệ thống");
      fetchSlides();
    } catch {
      showErrorToast("Lỗi", "Xóa slide thất bại");
    }
  };

  const handleStatusChange = async (newStatus, slideId) => {
    try {
      const response = await updateSlideStatus(slideId, newStatus);
      if (response.success) {
        showSuccessToast("Cập nhật", "Trạng thái hiển thị đã thay đổi");
        fetchSlides();
      }
    } catch {
      showErrorToast("Lỗi", "Không thể cập nhật trạng thái");
    }
  };

  const handleExportToExcel = () => {
    const dataExport = slides.map((s) => ({
      ID: `SL00${s.id}`,
      "Tiêu đề": s.title,
      "Link ảnh": `${URL_WEB}/uploads/${s.image}`,
      "Đường dẫn": s.link,
      "Vị trí": s.display_area,
      "Trạng thái": s.status === "active" ? "Hoạt động" : "Ẩn",
    }));
    const ws = XLSX.utils.json_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Slides");
    XLSX.writeFile(wb, "slides_report.xlsx");
  };

  const columns = [
    {
      title: 'HÌNH ẢNH',
      dataIndex: 'image',
      key: 'image',
      width: 150,
      render: (img, record) => (
        <div style={{ position: 'relative', width: 120, height: 60, overflow: 'hidden', borderRadius: 8 }}>
          <Image
            src={`${URL_WEB}/uploads/${img}`}
            alt={record.title}
            width={120}
            height={60}
            style={{ objectFit: 'cover' }}
            fallback="https://placehold.co/600x400?text=No+Image"
          />
        </div>
      ),
    },
    {
      title: 'THÔNG TIN SLIDE',
      key: 'info',
      render: (record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: '15px' }}>{record.title}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>ID: SL00{record.id}</Text>
          <Tag color="geekblue" style={{ marginTop: 4 }}>{record.display_area}</Tag>
        </Space>
      ),
    },
    {
      title: 'ĐIỀU HƯỚNG',
      dataIndex: 'link',
      key: 'link',
      render: (link) => (
        <Tooltip title={link}>
          <Button type="link" icon={<EyeOutlined />} href={link} target="_blank">
            Xem link
          </Button>
        </Tooltip>
      ),
    },
    {
      title: 'TRẠNG THÁI',
      key: 'status',
      width: 150,
      render: (record) => (
        <Select
          value={record.status}
          onChange={(val) => handleStatusChange(val, record.id)}
          style={{ width: 130 }}
          bordered={false}
          className={`status-select ${record.status}`}
        >
          <Select.Option value="active">
            <Tag color="success">● Hoạt động</Tag>
          </Select.Option>
          <Select.Option value="inactive">
            <Tag color="default">● Đang ẩn</Tag>
          </Select.Option>
        </Select>
      ),
    },
    {
      title: 'THỜI GIAN',
      key: 'time',
      render: (record) => (
        <Space direction="vertical" size={0}>
          <small>Bắt đầu: {new Date(record.start_date).toLocaleDateString("vi-VN")}</small>
          <small>Kết thúc: {new Date(record.end_date).toLocaleDateString("vi-VN")}</small>
        </Space>
      ),
    },
    {
      title: 'QUẢN LÝ',
      key: 'action',
      align: 'right',
      render: (record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Link to={`/slides/edit/${record.id}`}>
              <Button 
                icon={<EditOutlined />} 
                shape="circle" 
              />
            </Link>
          </Tooltip>
          <Popconfirm
            title="Xóa Slide này?"
            description="Dữ liệu này sẽ không thể khôi phục."
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
      <style>{`
        .status-select.active .ant-select-selector { font-weight: 600; color: #52c41a; }
        .status-select.inactive .ant-select-selector { color: #8c8c8c; }
        .slide-card .ant-table-thead > tr > th { background: #fafafa; text-transform: uppercase; font-size: 11px; color: #8c8c8c; }
      `}</style>

      {/* Header Section */}
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <Breadcrumb items={[{ title: 'Website' }, { title: 'Quản lý Slideshow' }]} />
          <Title level={3} style={{ marginTop: 8 }}><PictureOutlined /> Banner quảng cáo</Title>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={<FileExcelOutlined />} 
              onClick={handleExportToExcel}
              disabled={slides.length === 0}
            >
              Xuất báo cáo
            </Button>
            <Button 
              type="primary" 
              size="large" 
              icon={<PlusOutlined />} 
              style={{ background: '#5d4037', borderColor: '#5d4037', borderRadius: 8 }}
            >
              <Link to="/slides/create" style={{ color: 'white' }}>Thêm Slide mới</Link>
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Main Filter & Table */}
      <Card className="shadow-sm border-0 slide-card" style={{ borderRadius: 16 }}>
        <div className="mb-4 d-flex justify-content-between">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm tiêu đề slide..."
            style={{ width: 350, borderRadius: 8 }}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value, page: 1 })}
          />
          <Text type="secondary">Tổng số: <strong>{total}</strong> banner</Text>
        </div>

        <Table
          columns={columns}
          dataSource={slides}
          loading={loading}
          rowKey="id"
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: total,
            onChange: (page) => setFilters({ ...filters, page }),
            showSizeChanger: false,
          }}
          locale={{ emptyText: <Empty description="Không có dữ liệu slide" /> }}
        />
      </Card>

      <div className="mt-4 p-3 bg-white rounded-3 shadow-sm border">
        <Space>
          <SwapOutlined style={{ color: '#5d4037' }} />
          <Text type="secondary">Mẹo: Hệ thống tự động ưu tiên hiển thị các Slide ở trạng thái "Hoạt động" theo ngày bắt đầu mới nhất.</Text>
        </Space>
      </div>
    </div>
  );
};

export default SlideList;