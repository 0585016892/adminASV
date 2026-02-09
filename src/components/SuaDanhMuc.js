import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Form, Input, Button, Row, Col, Card, Select, 
  Typography, Space, Breadcrumb, ConfigProvider, 
  Spin, Divider 
} from "antd";
import { 
  SaveOutlined, ArrowLeftOutlined, EditOutlined, 
  InfoCircleOutlined, GlobalOutlined 
} from "@ant-design/icons";
import { getDanhMucById, updateDanhMuc } from "../api/danhmucApi";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";
import { useAuth } from "../contexts/AuthContext";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Helper tạo slug tự động
const generateSlug = (text) => {
  if (!text) return "";
  const from = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ";
  const to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyydD";
  let str = text.split("").map((c, i) => {
    const idx = from.indexOf(c);
    return idx > -1 ? to[idx] : c;
  }).join("");

  return str.toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

const SuaDanhMuc = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true); // Loading khi lấy dữ liệu
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading khi cập nhật

  useEffect(() => {
    const fetchDanhMuc = async () => {
      try {
        setLoading(true);
        const data = await getDanhMucById(id);
        form.setFieldsValue({
          name: data.name,
          slug: data.slug,
          status: data.status,
          description: data.description,
        });
      } catch (error) {
        showErrorToast("Lỗi", "Không thể lấy thông tin danh mục.");
      } finally {
        setLoading(false);
      }
    };
    fetchDanhMuc();
  }, [id, form]);

  // Tự động cập nhật slug khi gõ tên
  const handleNameChange = (e) => {
    const name = e.target.value;
    form.setFieldsValue({ slug: generateSlug(name) });
  };

  const onFinish = async (values) => {
    const jsonData = {
      ...values,
      userID: user.id
    };

    try {
      setIsSubmitting(true);
      const result = await updateDanhMuc(id, jsonData);
      
      if (result && (result.success || result.status === 200)) {
        showSuccessToast("Thành công", "Cập nhật danh mục hoàn tất!");
        setTimeout(() => navigate("/danh-muc/danh-sach"), 1500);
      } else {
        showErrorToast("Thất bại", result.message || "Có lỗi xảy ra.");
        setIsSubmitting(false);
      }
    } catch (error) {
      showErrorToast("Lỗi hệ thống", error.message || "Không thể kết nối API.");
      setIsSubmitting(false);
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#5d4037", borderRadius: 12 } }}>
      <div className="container-fluid p-4">
        <style>{`
          .edit-card { border-radius: 16px; border: 1px solid #f0ece1; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
          .section-title { color: #5d4037; display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
          .ant-form-item-label label { font-weight: 600; }
        `}</style>

        {/* Loading Overlay khi submit */}
        <Spin spinning={isSubmitting || loading} fullscreen tip={loading ? "Đang tải dữ liệu..." : "Đang lưu thay đổi..."} />

        {/* Breadcrumb & Header */}
        <Row className="mb-4 align-items-center">
          <Col span={12}>
            <Breadcrumb items={[{ title: "Quản lý" }, { title: "Danh mục" }, { title: "Chỉnh sửa" }]} className="mb-2" />
            <Title level={3} className="m-0"><EditOutlined /> Cập nhật Danh mục</Title>
          </Col>
          <Col span={12} className="text-end">
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Quay lại</Button>
          </Col>
        </Row>

        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish} 
          className="mt-4"
        >
          <Row gutter={24} justify="center">
            <Col xs={24} lg={18}>
              <Card className="edit-card">
                <Title level={5} className="section-title"><InfoCircleOutlined /> Thông tin cơ bản</Title>
                
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item 
                      name="name" 
                      label="Tên danh mục" 
                      rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                    >
                      <Input size="large" placeholder="Ví dụ: Thời trang nam" onChange={handleNameChange} />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Form.Item 
                      name="slug" 
                      label="Slug (Đường dẫn tĩnh)" 
                      rules={[{ required: true, message: 'Slug không được để trống' }]}
                    >
                      <Input size="large" prefix={<GlobalOutlined />} placeholder="thoi-trang-nam" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item 
                      name="status" 
                      label="Trạng thái hoạt động" 
                      rules={[{ required: true }]}
                    >
                      <Select size="large">
                        <Select.Option value="active">Kích hoạt (Hiển thị)</Select.Option>
                        <Select.Option value="inactive">Không kích hoạt (Ẩn)</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item 
                  name="description" 
                  label="Mô tả danh mục"
                >
                  <TextArea rows={5} placeholder="Nhập mô tả chi tiết về danh mục này..." />
                </Form.Item>

                <Divider />

                <div className="text-end">
                  <Space>
                    <Button size="large" onClick={() => navigate("/danh-muc/danh-sach")}>
                      Hủy bỏ
                    </Button>
                    <Button 
                      type="primary" 
                      size="large" 
                      icon={<SaveOutlined />} 
                      htmlType="submit"
                      loading={isSubmitting}
                      style={{ paddingLeft: 30, paddingRight: 30 }}
                    >
                      Lưu thay đổi
                    </Button>
                  </Space>
                </div>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </ConfigProvider>
  );
};

export default SuaDanhMuc;