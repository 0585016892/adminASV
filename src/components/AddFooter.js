import React, { useState, useEffect } from "react";
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
  Divider, 
  Spin 
} from "antd";
import { 
  ArrowLeftOutlined, 
  SaveOutlined, 
  PlusCircleOutlined,
  InfoCircleOutlined 
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getFooterParents, addFooterItem } from "../api/footerApi";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const { Title, Text } = Typography;

const AddFooter = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch danh sách cha ngay khi component mount
  useEffect(() => {
    const fetchParents = async () => {
      setLoading(true);
      try {
        const response = await getFooterParents();
        setParents(response.footerP || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục cha:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchParents();
  }, []);

  // 2. Xử lý gửi form
  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const dataToSend = {
        ...values,
        icon: 0, // Mặc định theo yêu cầu cũ của bạn
        parent_id: values.parent_id || null, // Chuyển chuỗi rỗng thành null
      };
      
      await addFooterItem(dataToSend);
      showSuccessToast("Footer", "Thêm mục mới thành công!");
      
      // Reset form sau khi thêm
      form.resetFields();
      
      // Chuyển hướng sau một khoảng thời gian ngắn
      setTimeout(() => {
        navigate("/footer/danh-sach");
      }, 1500);
    } catch (error) {
      showErrorToast("Footer", "Có lỗi xảy ra khi thêm mới.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header điều hướng */}
        <div className="mb-4">
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate("/footer/danh-sach")}
            className="p-0"
          >
            Quay lại danh sách
          </Button>
          <Title level={2} className="mt-2">
            <PlusCircleOutlined /> Thêm Footer Item
          </Title>
          <Text type="secondary">Tạo các liên kết hoặc nhóm thông tin mới dưới chân trang website.</Text>
        </div>

        <Spin spinning={loading}>
          <Card bordered={false} className="shadow-sm" style={{ borderRadius: 12 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                type: "link",
                status: "active",
                parent_id: ""
              }}
            >
              <Row gutter={24}>
                {/* Cột trái */}
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Tiêu đề hiển thị"
                    name="title"
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                  >
                    <Input placeholder="Ví dụ: Chính sách bảo mật" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Nhãn / Label"
                    name="label"
                    tooltip={{ title: 'Tên gợi nhớ hoặc text hiển thị phụ', icon: <InfoCircleOutlined /> }}
                  >
                    <Input placeholder="Nhập nhãn..." />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Giá trị (URL/Phone/Email)"
                    name="value"
                    rules={[{ required: true, message: 'Vui lòng nhập giá trị!' }]}
                  >
                    <Input placeholder="https://... hoặc 09xxx" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="Loại mục" name="type">
                    <Select>
                      <Select.Option value="link">Liên kết (Link)</Select.Option>
                      <Select.Option value="text">Văn bản (Text)</Select.Option>
                      <Select.Option value="group">Nhóm mục (Group)</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="Mục cha" name="parent_id">
                    <Select placeholder="Chọn mục cha nếu là mục con">
                      <Select.Option value="">Không có (Mục cấp 1)</Select.Option>
                      {parents.map((p) => (
                        <Select.Option key={p.id} value={p.id}>
                          {p.title}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="Trạng thái hiển thị" name="status">
                    <Select>
                      <Select.Option value="active">Hiện hoạt</Select.Option>
                      <Select.Option value="inactive">Đang ẩn</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <div className="text-end">
                <Space>
                  <Button onClick={() => navigate("/footer/danh-sach")}>
                    Hủy bỏ
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />}
                    loading={submitting}
                    style={{ background: '#5d4037', borderColor: '#5d4037', minWidth: 120 }}
                  >
                    Lưu dữ liệu
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>
        </Spin>
      </div>
    </div>
  );
};

export default AddFooter;