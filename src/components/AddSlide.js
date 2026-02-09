import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Upload,
  Card,
  Row,
  Col,
  Typography,
  Breadcrumb,
  Space,
  InputNumber,
  Alert,
  message,
} from "antd";
import {
  LinkOutlined,
  InboxOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
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

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  // Cleanup preview URL tránh memory leak
  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

  // ================= SUBMIT =================
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("title", values.title);
      formData.append("link", values.link || "");
      formData.append("position", values.position || 0);
      formData.append("status", values.status);
      formData.append("display_area", values.display_area);

      // Date range
      if (values.date_range) {
        formData.append("start_date", values.date_range[0].format("YYYY-MM-DD"));
        formData.append("end_date", values.date_range[1].format("YYYY-MM-DD"));
      }

      // Image
      if (values.image?.file) {
        formData.append("image", values.image.file);
      }

      await axios.post(`${API_URL}/slides/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSuccessToast("Slide", "Thêm slide thành công!");
      navigate("/slide-banner/danh-sach");
    } catch (err) {
      console.error("❌ Add slide error:", err);
      showErrorToast("Slide", "Không thể thêm slide");
    } finally {
      setLoading(false);
    }
  };

  // ================= VALIDATE IMAGE =================
  const beforeUpload = (file) => {
    const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    if (!isImage) {
      message.error("Chỉ cho phép JPG, PNG, WEBP!");
      return Upload.LIST_IGNORE;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Ảnh phải nhỏ hơn 5MB!");
      return Upload.LIST_IGNORE;
    }

    setPreviewImage(URL.createObjectURL(file));
    return false; // không auto upload
  };

  // ================= UI =================
  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh", padding: 20 }}>
      {/* HEADER */}
      <Breadcrumb
        items={[
          { title: "Website" },
          { title: "Quản lý Banner" },
          { title: "Thêm mới" },
        ]}
      />

      <Space align="center" style={{ marginTop: 12 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text" />
        <Title level={3} style={{ margin: 0 }}>
          Tạo Slide Mới
        </Title>
      </Space>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          status: "active",
          display_area: "home_banner",
          position: 0,
          date_range: [dayjs(), dayjs().add(1, "year")],
        }}
      >
        <Row gutter={24}>
          {/* LEFT COLUMN */}
          <Col xs={24} lg={16}>
            <Card title="Thông tin hiển thị" bordered={false} style={{ borderRadius: 16 }}>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="title"
                    label="Tiêu đề Slide"
                    rules={[{ required: true, message: "Nhập tiêu đề!" }]}
                  >
                    <Input size="large" placeholder="Ưu đãi mùa hè 2026" />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item name="link" label="URL khi click">
                    <Input
                      prefix={<LinkOutlined />}
                      size="large"
                      placeholder="https://domain.com/san-pham"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="display_area" label="Vị trí hiển thị">
                    <Select size="large">
                      <Select.Option value="home_banner">Trang chủ</Select.Option>
                      <Select.Option value="sidebar">Sidebar</Select.Option>
                      <Select.Option value="popup">Popup</Select.Option>
                      <Select.Option value="footer">Footer</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="date_range" label="Thời hạn hiển thị">
                    <DatePicker.RangePicker size="large" className="w-100" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="position" label="Thứ tự ưu tiên">
                    <InputNumber min={0} size="large" className="w-100" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="status" label="Trạng thái">
                    <Select size="large">
                      <Select.Option value="active">Hiển thị</Select.Option>
                      <Select.Option value="inactive">Ẩn</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Alert
              style={{ marginTop: 20, borderRadius: 12 }}
              showIcon
              type="info"
              message="Khuyến nghị ảnh"
              description="Trang chủ: 1920x1080 (16:9). Sidebar: 600x600 (1:1). Dung lượng < 5MB."
            />
          </Col>

          {/* RIGHT COLUMN */}
          <Col xs={24} lg={8}>
            <Card title="Ảnh Banner" bordered={false} style={{ borderRadius: 16 }}>
              <Form.Item
                name="image"
                rules={[{ required: true, message: "Chọn ảnh slide!" }]}
              >
                <Dragger
                  maxCount={1}
                  beforeUpload={beforeUpload}
                  showUploadList={false}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ color: "#5d4037" }} />
                  </p>
                  <p>Kéo thả hoặc click để upload</p>
                  <p>JPG, PNG, WEBP - Max 5MB</p>
                </Dragger>
              </Form.Item>

              {previewImage && (
                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <Text type="secondary">Preview:</Text>
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      border: "1px solid #eee",
                      marginTop: 8,
                    }}
                  />
                </div>
              )}
            </Card>

            <Card bordered={false} style={{ marginTop: 20, borderRadius: 16 }}>
              <Space direction="vertical" className="w-100">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<SaveOutlined />}
                  loading={loading}
                  block
                  style={{ background: "#5d4037", borderColor: "#5d4037", height: 50 }}
                >
                  Thêm Slide
                </Button>

                <Button block size="large" disabled={loading} onClick={() => navigate(-1)}>
                  Hủy
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
