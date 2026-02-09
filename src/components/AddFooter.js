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
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusCircleOutlined,
  InfoCircleOutlined,
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

  // ================== LOAD PARENTS ==================
  useEffect(() => {
    const fetchParents = async () => {
      setLoading(true);
      try {
        const res = await getFooterParents();
        setParents(res?.footerP || res?.data || []);
      } catch (err) {
        console.error("❌ Lỗi load footer parents:", err);
        showErrorToast("Footer", "Không thể tải danh mục cha");
      } finally {
        setLoading(false);
      }
    };

    fetchParents();
  }, []);

  // ================== SUBMIT FORM ==================
  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const data = {
        ...values,
        icon: 0,
        parent_id: values.parent_id ?? null, // đảm bảo null thay vì ""
      };

      await addFooterItem(data);
      showSuccessToast("Footer", "Thêm mục footer thành công!");

      form.resetFields();
      navigate("/footer/danh-sach");
    } catch (err) {
      console.error("❌ Add footer error:", err);
      showErrorToast("Footer", "Thêm footer thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loading || submitting;

  // ================== UI ==================
  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* HEADER */}
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/footer/danh-sach")}
          style={{ padding: 0 }}
        >
          Quay lại danh sách
        </Button>

        <Title level={2} style={{ marginTop: 8 }}>
          <PlusCircleOutlined /> Thêm Footer Item
        </Title>
        <Text type="secondary">
          Tạo liên kết hoặc nhóm thông tin hiển thị ở chân trang website.
        </Text>

        <Spin spinning={loading}>
          <Card
            bordered={false}
            style={{
              marginTop: 20,
              borderRadius: 14,
              boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
            }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              disabled={submitting}
              initialValues={{
                type: "link",
                status: "active",
                parent_id: null,
              }}
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Tiêu đề hiển thị"
                    name="title"
                    rules={[{ required: true, message: "Nhập tiêu đề!" }]}
                  >
                    <Input placeholder="Ví dụ: Chính sách bảo mật" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Nhãn phụ"
                    name="label"
                    tooltip={{
                      title: "Text hiển thị phụ",
                      icon: <InfoCircleOutlined />,
                    }}
                  >
                    <Input placeholder="VD: New, Hot, Updated..." />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Giá trị (URL / Phone / Email)"
                    name="value"
                    rules={[{ required: true, message: "Nhập giá trị!" }]}
                  >
                    <Input placeholder="https://... hoặc 09xxx hoặc email" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="Loại mục" name="type">
                    <Select>
                      <Select.Option value="link">Liên kết</Select.Option>
                      <Select.Option value="text">Văn bản</Select.Option>
                      <Select.Option value="group">Nhóm</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="Mục cha" name="parent_id">
                    <Select allowClear placeholder="Mục cấp 1 (không chọn)">
                      {parents.map((p) => (
                        <Select.Option key={p.id} value={p.id}>
                          {p.title}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="Trạng thái" name="status">
                    <Select>
                      <Select.Option value="active">Hiển thị</Select.Option>
                      <Select.Option value="inactive">Ẩn</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <div style={{ textAlign: "right" }}>
                <Space>
                  <Button onClick={() => navigate("/footer/danh-sach")}>
                    Hủy
                  </Button>

                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={submitting}
                    style={{
                      background: "#5d4037",
                      borderColor: "#5d4037",
                      minWidth: 140,
                    }}
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
