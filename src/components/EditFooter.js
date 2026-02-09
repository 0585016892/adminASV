import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Spin, 
  Divider, 
  Breadcrumb ,
  Tag
} from "antd";
import { 
  ArrowLeftOutlined, 
  SaveOutlined, 
  EditOutlined,
  LoadingOutlined 
} from "@ant-design/icons";
import { getFooterById, updateFooter } from "../api/footerApi";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const { Title, Text } = Typography;

const EditFooter = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true); // Loading khi lấy dữ liệu cũ
  const [submitting, setSubmitting] = useState(false); // Loading khi đang lưu

  // 1. Lấy dữ liệu cũ và đổ vào Form
  useEffect(() => {
    const fetchFooter = async () => {
      setLoading(true);
      try {
        const productData = await getFooterById(id);
        form.setFieldsValue({
          title: productData.title,
          label: productData.label,
          status: productData.status,
          value: productData.value, // Thêm các trường nếu API có trả về
          type: productData.type
        });
      } catch (error) {
        showErrorToast("Lỗi", "Không thể lấy thông tin footer.");
      } finally {
        setLoading(false);
      }
    };

    fetchFooter();
  }, [id, form]);

  // 2. Xử lý cập nhật
  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await updateFooter(id, values);
      showSuccessToast("Footer", "Cập nhật thành công!");
      
      setTimeout(() => {
        navigate("/footer/danh-sach");
      }, 1500);
    } catch (error) {
      showErrorToast("Lỗi", error.message || "Có lỗi xảy ra khi sửa.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        
        {/* Điều hướng & Tiêu đề */}
        <div className="mb-4">
          <Breadcrumb items={[{ title: 'Quản lý' }, { title: 'Footer' }, { title: 'Sửa' }]} />
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate("/footer/danh-sach")}
            className="p-0 mt-2"
          >
            Quay lại danh sách
          </Button>
          <Title level={2} className="mt-2">
            <EditOutlined /> Sửa mục Footer
          </Title>
          <Text type="secondary">Cập nhật thông tin ID: <Tag color="blue">{id}</Tag></Text>
        </div>

        <Card bordered={false} className="shadow-sm" style={{ borderRadius: 12 }}>
          <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Tiêu đề hiển thị"
                    name="title"
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                  >
                    <Input placeholder="Nhập tên tiêu đề" size="large" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Liên kết / URL"
                    name="label"
                    rules={[{ required: true, message: 'Vui lòng nhập liên kết!' }]}
                  >
                    <Input placeholder="Nhập liên kết (URL, phone, email...)" size="large" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Trạng thái"
                    name="status"
                    rules={[{ required: true }]}
                  >
                    <Select size="large">
                      <Select.Option value="active">Kích hoạt (Hiện)</Select.Option>
                      <Select.Option value="inactive">Không kích hoạt (Ẩn)</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <div className="text-end">
                <Space>
                  <Button size="large" onClick={() => navigate("/footer/danh-sach")}>
                    Hủy bỏ
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />}
                    loading={submitting}
                    size="large"
                    style={{ background: '#5d4037', borderColor: '#5d4037', minWidth: 150 }}
                  >
                    Cập nhật ngay
                  </Button>
                </Space>
              </div>
            </Form>
          </Spin>
        </Card>
      </div>
    </div>
  );
};

export default EditFooter;