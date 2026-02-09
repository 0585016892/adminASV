import React, { useState, useEffect } from "react";
import { 
  Form, Input, Button, DatePicker, Select, 
  Upload, Card, Row, Col, Typography, 
  Breadcrumb, Space, Spin, Image 
} from "antd";
import { 
  PictureOutlined, 
  LinkOutlined, 
  SaveOutlined, 
  ArrowLeftOutlined,
  InboxOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { getSlideById, updateSlide } from "../api/slideApi";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const { Title, Text } = Typography;
const { Dragger } = Upload;
const URL_WEB = process.env.REACT_APP_WEB_URL;

const EditSlide = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  // 1. Fetch dữ liệu cũ
  useEffect(() => {
    const fetchSlide = async () => {
      setLoading(true);
      try {
        const data = await getSlideById(id);
        // Map dữ liệu về format của Ant Design
        form.setFieldsValue({
          ...data,
          date_range: [
            data.start_date ? dayjs(data.start_date) : null,
            data.end_date ? dayjs(data.end_date) : null
          ]
        });
        if (data.image) {
          setPreviewImage(`${URL_WEB}/uploads/${data.image}`);
        }
      } catch (error) {
        showErrorToast("Lỗi", "Không thể tải thông tin slide.");
      } finally {
        setLoading(false);
      }
    };
    fetchSlide();
  }, [id, form]);

  // 2. Xử lý gửi form
  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("link", values.link || "");
      formData.append("status", values.status || "active");
      formData.append("display_area", values.display_area);
      formData.append("position", values.position || 0);
      
      // Xử lý ngày tháng từ RangePicker
      if (values.date_range) {
        formData.append("start_date", values.date_range[0].format("YYYY-MM-DD"));
        formData.append("end_date", values.date_range[1].format("YYYY-MM-DD"));
      }

      // Kiểm tra nếu có ảnh mới được upload
      if (values.image && values.image.file) {
        formData.append("image", values.image.file);
      }

      await updateSlide(id, formData);
      showSuccessToast("Thành công", "Thông tin slide đã được cập nhật!");
      setTimeout(() => navigate("/slide-banner/danh-sach"), 1500);
    } catch (error) {
      showErrorToast("Thất bại", "Có lỗi xảy ra khi cập nhật.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px' }}>
      <Spin size="large" tip="Đang tải dữ liệu..." />
    </div>
  );

  return (
    <div className="p-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header & Breadcrumb */}
      <div className="mb-4">
        <Breadcrumb items={[
          { title: 'Quản lý banner' },
          { title: 'Danh sách' },
          { title: 'Chỉnh sửa slide' }
        ]} />
        <Space align="center" style={{ marginTop: 12 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)} 
            type="text"
          />
          <Title level={3} style={{ margin: 0 }}>Cập nhật nội dung Banner</Title>
        </Space>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish}
        initialValues={{ status: 'active' }}
      >
        <Row gutter={24}>
          {/* Cột trái: Thông tin nội dung */}
          <Col xs={24} lg={16}>
            <Card title="Thông tin cơ bản" className="shadow-sm" style={{ borderRadius: 12 }}>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item 
                    name="title" 
                    label="Tên Slide / Tiêu đề" 
                    rules={[{ required: true, message: 'Vui lòng nhập tên slide' }]}
                  >
                    <Input placeholder="Ví dụ: Banner khuyến mãi Tết 2026" size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="link" label="Đường dẫn liên kết (URL)">
                    <Input prefix={<LinkOutlined />} placeholder="https://..." size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="date_range" label="Thời gian hiển thị">
                    <DatePicker.RangePicker 
                      className="w-100" 
                      size="large"
                      format="DD/MM/YYYY"
                      placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="display_area" label="Khu vực hiển thị" rules={[{ required: true }]}>
                    <Select size="large">
                      <Select.Option value="home">Banner Trang chủ</Select.Option>
                      <Select.Option value="popup">BST (Bộ sưu tập)</Select.Option>
                      <Select.Option value="sidebar">Thanh bên (Sidebar)</Select.Option>
                      <Select.Option value="footer">Chân trang (Footer)</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="status" label="Trạng thái">
                    <Select size="large">
                      <Select.Option value="active">Đang hoạt động</Select.Option>
                      <Select.Option value="inactive">Tạm ẩn</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Cột phải: Hình ảnh & Action */}
          <Col xs={24} lg={8}>
            <Card title="Hình ảnh Banner" className="shadow-sm mb-4" style={{ borderRadius: 12 }}>
              <Form.Item name="image">
                <Dragger 
                  maxCount={1} 
                  beforeUpload={() => false}
                  onChange={(info) => {
                    if (info.file) {
                      setPreviewImage(URL.createObjectURL(info.file));
                    }
                  }}
                  showUploadList={false}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ color: '#5d4037' }} />
                  </p>
                  <p className="ant-upload-text">Nhấp hoặc kéo ảnh vào đây</p>
                  <p className="ant-upload-hint">Hỗ trợ JPG, PNG, WEBP (Max 2MB)</p>
                </Dragger>
              </Form.Item>

              {previewImage && (
                <div className="mt-3 text-center">
                  <Text type="secondary" block className="mb-2">Hình ảnh hiện tại:</Text>
                  <Image 
                    src={previewImage} 
                    style={{ borderRadius: 8, maxHeight: 150, objectFit: 'cover' }} 
                  />
                </div>
              )}
            </Card>

            <Card bordered={false} className="shadow-sm" style={{ borderRadius: 12, background: '#fafafa' }}>
              <Space direction="vertical" className="w-100">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large" 
                  block 
                  icon={<SaveOutlined />}
                  loading={submitting}
                  style={{ background: '#5d4037', borderColor: '#5d4037', height: '50px' }}
                >
                  Lưu thay đổi
                </Button>
                <Button 
                  size="large" 
                  block 
                  onClick={() => navigate(-1)}
                  disabled={submitting}
                >
                  Hủy bỏ
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default EditSlide;