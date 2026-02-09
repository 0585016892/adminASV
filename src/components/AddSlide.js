import React, { useState } from "react";
import { 
  Form, Input, Button, DatePicker, Select, 
  Upload, Card, Row, Col, Typography, 
  Breadcrumb, Space, InputNumber, Alert 
} from "antd";
import { 
  PlusOutlined, 
  LinkOutlined, 
  PictureOutlined, 
  InboxOutlined,
  SaveOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const { Title, Text } = Typography;
const { Dragger } = Upload;

const AddSlide = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  const onFinish = async (values) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Xử lý dữ liệu text
      formData.append("title", values.title);
      formData.append("link", values.link || "");
      formData.append("position", values.position || 0);
      formData.append("status", values.status);
      formData.append("display_area", values.display_area);
      
      // Xử lý ngày tháng từ RangePicker
      if (values.date_range) {
        formData.append("start_date", values.date_range[0].format("YYYY-MM-DD"));
        formData.append("end_date", values.date_range[1].format("YYYY-MM-DD"));
      }

      // Xử lý File ảnh
      if (values.image && values.image.file) {
        formData.append("image", values.image.file);
      }

      await axios.post(`${API_URL}/slides/add`, formData);

      showSuccessToast("Thành công", "Đã thêm slide mới vào hệ thống!");
      setTimeout(() => navigate("/slide-banner/danh-sach"), 1000);
    } catch (err) {
      showErrorToast("Lỗi", "Không thể thêm slide. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* 1. Header & Điều hướng */}
      <div className="mb-4">
        <Breadcrumb items={[
          { title: 'Website' },
          { title: 'Quản lý Banner' },
          { title: 'Thêm mới' }
        ]} />
        <Space align="center" style={{ marginTop: 12 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)} 
            type="text"
          />
          <Title level={3} style={{ margin: 0 }}>Tạo Slide Mới</Title>
        </Space>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish}
        initialValues={{ 
          status: 'active', 
          display_area: 'home_banner',
          position: 0,
          date_range: [dayjs(), dayjs().add(1, 'year')]
        }}
      >
        <Row gutter={24}>
          {/* Cột trái: Nội dung chính */}
          <Col xs={24} lg={16}>
            <Card title="Thông tin hiển thị" className="shadow-sm border-0" style={{ borderRadius: 16 }}>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item 
                    name="title" 
                    label="Tiêu đề Slide" 
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                  >
                    <Input placeholder="Ví dụ: Ưu đãi mùa hè 2026" size="large" />
                  </Form.Item>
                </Col>
                
                <Col span={24}>
                  <Form.Item name="link" label="Đường dẫn khi click (URL)">
                    <Input prefix={<LinkOutlined />} placeholder="https://acoustic-harmony.com/san-pham" size="large" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="display_area" label="Vị trí hiển thị">
                    <Select size="large">
                      <Select.Option value="home_banner">Banner Trang chủ (Lớn)</Select.Option>
                      <Select.Option value="sidebar">Thanh bên (Sidebar)</Select.Option>
                      <Select.Option value="popup">BST nổi bật (Popup)</Select.Option>
                      <Select.Option value="footer">Chân trang (Footer)</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="date_range" label="Thời hạn hiển thị">
                    <DatePicker.RangePicker 
                      className="w-100" 
                      size="large" 
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="position" label="Thứ tự ưu tiên">
                    <InputNumber min={0} className="w-100" size="large" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="status" label="Trạng thái">
                    <Select size="large">
                      <Select.Option value="active">Hiển thị ngay</Select.Option>
                      <Select.Option value="inactive">Lưu bản nháp (Ẩn)</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Alert
              className="mt-4"
              message="Lưu ý kích thước ảnh"
              description="Để banner hiển thị đẹp nhất, hãy sử dụng ảnh có tỉ lệ 16:9 cho Trang chủ và tỉ lệ 1:1 cho Sidebar."
              type="info"
              showIcon
              style={{ borderRadius: 12 }}
            />
          </Col>

          {/* Cột phải: Upload Ảnh & Submit */}
          <Col xs={24} lg={8}>
            <Card title="Hình ảnh Banner" className="shadow-sm border-0 mb-4" style={{ borderRadius: 16 }}>
              <Form.Item 
                name="image" 
                rules={[{ required: true, message: 'Vui lòng chọn ảnh cho slide' }]}
              >
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
                  <p className="ant-upload-text">Kéo thả hoặc nhấp để tải ảnh</p>
                  <p className="ant-upload-hint">PNG, JPG, WEBP (Tối đa 5MB)</p>
                </Dragger>
              </Form.Item>

              {previewImage && (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Text type="secondary" block className="mb-2">Xem trước ảnh:</Text>
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', borderRadius: 12, border: '1px solid #f0f0f0' }} 
                  />
                </div>
              )}
            </Card>

            <Card className="shadow-sm border-0" style={{ borderRadius: 16, background: '#fafafa' }}>
              <Space direction="vertical" className="w-100">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large" 
                  block 
                  icon={<SaveOutlined />}
                  loading={isLoading}
                  style={{ background: '#5d4037', borderColor: '#5d4037', height: '50px' }}
                >
                  Xác nhận thêm Slide
                </Button>
                <Button 
                  size="large" 
                  block 
                  onClick={() => navigate(-1)}
                  disabled={isLoading}
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

export default AddSlide;