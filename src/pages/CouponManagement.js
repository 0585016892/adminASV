import React, { useState, useEffect } from "react";
import { 
  Table, Button, Input, Select, Tag, Space, Typography, 
  Modal, Form, Row, Col, Card, Pagination, Spin, 
  Tooltip, Switch, DatePicker, InputNumber, Divider, Empty
} from "antd";
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  FileExcelOutlined, SearchOutlined, GiftOutlined,
  ClockCircleOutlined, ThunderboltOutlined, CheckCircleOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { 
  filterCoupon, createCoupon, updateCoupon, 
  deleteCoupon, updateCouponStatus 
} from "../api/couponApi";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const { Title, Text } = Typography;
const { confirm } = Modal;

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [form] = Form.useForm();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 8,
    status: "",
    keyword: "",
    discount_type: "",
    min_order_total: "",
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await filterCoupon(filters);
      setCoupons(data.coupons || []);
      setTotalPages(data.totalOrders || 0); // Giả sử API trả về total count
    } catch (error) {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (record = null) => {
    setEditingCoupon(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        dates: [dayjs(record.start_date), dayjs(record.end_date)],
        status: record.status === "active"
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ discount_type: 'fixed', status: true });
    }
    setShowModal(true);
  };

  const onFinish = async (values) => {
    const payload = {
      ...values,
      start_date: values.dates[0].format('YYYY-MM-DD HH:mm:ss'),
      end_date: values.dates[1].format('YYYY-MM-DD HH:mm:ss'),
      status: values.status ? "active" : "inactive"
    };
    delete payload.dates;

    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, payload);
        showSuccessToast("Thành công", "Đã cập nhật mã giảm giá");
      } else {
        await createCoupon(payload);
        showSuccessToast("Thành công", "Đã thêm mã mới");
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      showErrorToast("Lỗi", err.message || "Thao tác thất bại");
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Xác nhận xóa mã?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteCoupon(id);
          showSuccessToast("Thành công", "Đã xóa mã giảm giá");
          fetchData();
        } catch (error) {
          showErrorToast("Lỗi", "Không thể xóa mã");
        }
      }
    });
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await updateCouponStatus(id, newStatus);
      showSuccessToast("Cập nhật", "Đã thay đổi trạng thái mã");
      fetchData();
    } catch (error) {
      showErrorToast("Lỗi", "Cập nhật trạng thái thất bại");
    }
  };

  const exportToExcel = () => {
    const exportData = coupons.map(c => ({
      "Mã": c.code,
      "Loại": c.discount_type === 'fixed' ? 'Tiền mặt' : 'Phần trăm',
      "Giá trị": c.discount_value,
      "Đơn tối thiểu": c.min_order_total,
      "Hạn dùng": `${dayjs(c.start_date).format('DD/MM')} - ${dayjs(c.end_date).format('DD/MM')}`,
      "Trạng thái": c.status === 'active' ? 'Bật' : 'Tắt'
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Coupons");
    XLSX.writeFile(workbook, "Danh_sach_khuyen_mai.xlsx");
  };

  const columns = [
    {
      title: 'MÃ CODE',
      dataIndex: 'code',
      render: (text) => <Tag color="#5d4037" style={{ fontWeight: 'bold', fontSize: '14px', padding: '4px 10px' }}>{text}</Tag>,
    },
    {
      title: 'LOẠI GIẢM',
      dataIndex: 'discount_type',
      render: (type, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{type === 'percent' ? `${record.discount_value}%` : `${Number(record.discount_value).toLocaleString()}đ`}</Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {record.description == 1 ? "Sản phẩm" : "Tổng hóa đơn"}
          </Text>
        </Space>
      ),
    },
    {
      title: 'HIỆU LỰC',
      key: 'validity',
      render: (_, r) => {
        const isExpired = dayjs().isAfter(dayjs(r.end_date));
        return (
          <Space direction="vertical" size={0}>
            <Text style={{ fontSize: '12px' }}>{dayjs(r.start_date).format('DD/MM/YY')} - {dayjs(r.end_date).format('DD/MM/YY')}</Text>
            {isExpired && <Tag color="error" bordered={false} style={{ fontSize: '10px' }}>Hết hạn</Tag>}
          </Space>
        );
      }
    },
    {
      title: 'SỐ LƯỢNG',
      dataIndex: 'quantity',
      align: 'center',
      render: (q) => <Text strong color={q === 0 ? "red" : "black"}>{q}</Text>
    },
    {
      title: 'TRẠNG THÁI',
      key: 'status',
      render: (_, r) => (
        <Switch 
          checked={r.status === "active"} 
          onChange={() => toggleStatus(r.id, r.status)}
          disabled={dayjs().isAfter(dayjs(r.end_date)) || r.quantity === 0}
        />
      )
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      align: 'right',
      render: (_, r) => (
        <Space>
          <Button type="text" icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => handleOpenModal(r)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
        </Space>
      )
    }
  ];

  return (
    <div className="p-4 bg-light min-vh-100">
      <style>{`
        .ant-table-thead > tr > th { background: #fdfcf8 !important; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
        .stat-card { border-radius: 16px; border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      `}</style>

      {/* Header Section */}
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <Title level={3} style={{ margin: 0 }}><GiftOutlined /> Quản lý Chương trình Khuyến mãi</Title>
          <Text type="secondary">Thiết lập và theo dõi các mã giảm giá toàn hệ thống</Text>
        </Col>
        <Col>
          <Space>
            <Button icon={<FileExcelOutlined />} onClick={exportToExcel}>Xuất báo cáo</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()} style={{ background: '#5d4037', borderColor: '#5d4037' }}>
              Tạo mã mới
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Filter Section */}
      <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: '12px' }}>
        <Row gutter={16}>
          <Col span={6}>
            <Input 
              prefix={<SearchOutlined />} 
              placeholder="Tìm mã code..." 
              onChange={e => setFilters({...filters, keyword: e.target.value, page: 1})}
            />
          </Col>
          <Col span={6}>
            <Select 
              className="w-100" 
              placeholder="Loại giảm giá" 
              allowClear
              onChange={val => setFilters({...filters, discount_type: val, page: 1})}
              options={[{ label: 'Cố định', value: 'fixed' }, { label: 'Phần trăm', value: 'percent' }]}
            />
          </Col>
          <Col span={6}>
            <Select 
              className="w-100" 
              placeholder="Trạng thái" 
              allowClear
              onChange={val => setFilters({...filters, status: val, page: 1})}
              options={[{ label: 'Đang hoạt động', value: 'active' }, { label: 'Tạm ngưng', value: 'inactive' }]}
            />
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <div className="bg-white p-3 rounded-4 shadow-sm">
        <Table 
          columns={columns} 
          dataSource={coupons} 
          rowKey="id" 
          loading={loading}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: totalPages,
            onChange: (p) => setFilters({...filters, page: p}),
            position: ['bottomCenter']
          }}
          locale={{ emptyText: <Empty description="Chưa có mã giảm giá nào" /> }}
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        title={<Title level={4}>{editingCoupon ? "Cập nhật mã" : "Tạo mã khuyến mãi mới"}</Title>}
        open={showModal}
        onCancel={() => setShowModal(false)}
        onOk={() => form.submit()}
        width={700}
        okText={editingCoupon ? "Lưu thay đổi" : "Tạo ngay"}
        okButtonProps={{ style: { background: '#5d4037' } }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="code" label="Mã Coupon" rules={[{ required: true, message: 'Nhập mã code' }]}>
                <Input placeholder="VÍ DỤ: GIAM20K" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
              <Form.Item name="description" label="Phạm vi áp dụng" initialValue="1">
                <Select options={[{ label: 'Từng sản phẩm', value: '1' }, { label: 'Toàn bộ hóa đơn', value: '0' }]} />
              </Form.Item>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="discount_type" label="Hình thức">
                    <Select options={[{ label: 'Tiền mặt', value: 'fixed' }, { label: '% Giảm', value: 'percent' }]} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="discount_value" label="Giá trị giảm" rules={[{ required: true }]}>
                    <InputNumber className="w-100" min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Form.Item name="dates" label="Thời gian hiệu lực" rules={[{ required: true }]}>
                <DatePicker.RangePicker className="w-100" showTime format="DD/MM/YYYY HH:mm" />
              </Form.Item>
              <Form.Item name="min_order_total" label="Giá trị đơn tối thiểu">
                <InputNumber className="w-100" min={0} step={10000} />
              </Form.Item>
              <Form.Item name="quantity" label="Số lượng phát hành" rules={[{ required: true }]}>
                <InputNumber className="w-100" min={1} />
              </Form.Item>
              <Form.Item name="status" label="Kích hoạt ngay" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default CouponManagement;