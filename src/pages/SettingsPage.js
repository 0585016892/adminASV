import React, { useEffect, useState } from "react";
import {
  Tabs,
  Form,
  Input,
  Button,
  Row,
  Col,
  Card,
  Select,
  InputNumber,
  Space,
  Typography,
  Upload,
  Spin,
} from "antd";
import {
  MailOutlined,
  GlobalOutlined,
  CreditCardOutlined,
  SettingOutlined,
  SaveOutlined,
  UploadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { getSettingsAPI, updateSettingsWithFilesAPI } from "../api/settingsApi";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const { Title, Text } = Typography;

const SettingsPage = () => {
  const [form] = Form.useForm();
  const URL_WEB = process.env.REACT_APP_WEB_URL || "";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Lưu file raw (File Object) để append vào FormData
  const [files, setFiles] = useState({ site_logo: null, site_favicon: null });
  // Lưu đường dẫn hiển thị preview (blob URL hoặc URL từ backend)
  const [previews, setPreviews] = useState({ site_logo: "", site_favicon: "" });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await getSettingsAPI();

        // Đổ dữ liệu vào form của Ant Design
        form.setFieldsValue(data);

        // Set ảnh preview ban đầu từ server
        setPreviews({
          site_logo: data.site_logo ? `${URL_WEB}${data.site_logo}` : "",
          site_favicon: data.site_favicon
            ? `${URL_WEB}${data.site_favicon}`
            : "",
        });
      } catch (err) {
        showErrorToast("Lỗi", "Không thể tải cấu hình hệ thống.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [form, URL_WEB]);

  // Xử lý khi chọn file mới
  const handleFileChange = (info, fieldName) => {
    // Ant Design Upload kích hoạt onChange nhiều lần dựa theo status (uploading, done, v.v.)
    // Vì beforeUpload trả về false, file sẽ ở trạng thái 'img' hoặc 'done' tạm thời tùy phiên bản.
    const file = info.file;

    // Lấy file gốc object
    const rawFile = file.originFileObj || file;

    if (rawFile) {
      setFiles((prev) => ({ ...prev, [fieldName]: rawFile }));

      // Tạo URL tạm thời để hiển thị ngay lập tức lên giao diện cho user xem trước
      const blobUrl = URL.createObjectURL(rawFile);
      setPreviews((prev) => ({
        ...prev,
        [fieldName]: blobUrl,
      }));
    }
  };

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const formData = new FormData();

      // Append các field text từ form
      Object.keys(values).forEach((key) => {
        // Tránh append đè chuỗi path ảnh cũ từ form values nếu server trả về dạng string
        if (key !== "site_logo" && key !== "site_favicon") {
          formData.append(key, values[key] ?? "");
        }
      });

      // Append files thực tế nếu người dùng có chọn file mới
      if (files.site_logo) {
        formData.append("site_logo", files.site_logo);
      }
      if (files.site_favicon) {
        formData.append("site_favicon", files.site_favicon);
      }

      await updateSettingsWithFilesAPI(formData);
      showSuccessToast("Thành công", "Cấu hình đã được cập nhật!");

      // Tải lại trang sau 1s để cập nhật UI toàn hệ thống
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      showErrorToast("Lỗi", "Không thể lưu cấu hình.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="text-center p-5">
        <Spin size="large" tip="Đang tải cấu hình..." />
      </div>
    );

  return (
    <div className="p-4" style={{ background: "#f0f2f5", minHeight: "100vh" }}>
      <div className="mb-4">
        <Title level={3}>⚙️ Cấu hình hệ thống</Title>
        <Text type="secondary">
          Quản lý các thiết lập chung, SMTP, Website và Thanh toán.
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
      >
        <Tabs
          type="card"
          className="shadow-sm"
          style={{ background: "#fff", padding: "16px", borderRadius: "8px" }}
          items={[
            {
              key: "smtp",
              label: (
                <span>
                  <MailOutlined /> SMTP / Email
                </span>
              ),
              children: (
                <div className="p-3">
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item label="SMTP Host" name="smtp_host">
                        <Input placeholder="mail.example.com" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label="SMTP Port" name="smtp_port">
                        <Input placeholder="465" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label="SMTP Secure" name="smtp_secure">
                        <Select>
                          <Select.Option value="true">
                            SSL/TLS (Khuyên dùng)
                          </Select.Option>
                          <Select.Option value="false">None</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="SMTP Username" name="smtp_username">
                        <Input placeholder="admin@example.com" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="SMTP Password" name="smtp_password">
                        <Input.Password
                          iconRender={(visible) =>
                            visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Email gửi đi (Từ tên)"
                        name="email_from_name"
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Địa chỉ Email gửi"
                        name="email_from_address"
                      >
                        <Input type="email" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: "website",
              label: (
                <span>
                  <GlobalOutlined /> Website
                </span>
              ),
              children: (
                <div className="p-3">
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item label="Tên Website" name="site_name">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Mô tả SEO" name="site_description">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label="Logo Website">
                        <div
                          className="mb-2 border p-2 text-center d-flex align-items-center justify-content-center"
                          style={{
                            height: 100,
                            background: "#fafafa",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          {previews.site_logo ? (
                            <img
                              src={previews.site_logo}
                              alt="Logo"
                              style={{
                                maxHeight: "100%",
                                maxWidth: "100%",
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            <Text type="secondary">Chưa có logo</Text>
                          )}
                        </div>
                        <Upload
                          showUploadList={false}
                          beforeUpload={() => false}
                          onChange={(info) =>
                            handleFileChange(info, "site_logo")
                          }
                          accept="image/*"
                        >
                          <Button icon={<UploadOutlined />} block>
                            Chọn Logo
                          </Button>
                        </Upload>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label="Favicon">
                        <div
                          className="mb-2 border p-2 text-center"
                          style={{
                            height: 100,
                            background: "#fafafa",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          {previews.site_favicon ? (
                            <img
                              src={previews.site_favicon}
                              alt="Favicon"
                              style={{
                                maxHeight: "100%",
                                maxWidth: "100%",
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            <Text type="secondary">Chưa có icon</Text>
                          )}
                        </div>
                        <Upload
                          showUploadList={false}
                          beforeUpload={() => false}
                          onChange={(info) =>
                            handleFileChange(info, "site_favicon")
                          }
                          accept="image/*"
                        >
                          <Button icon={<UploadOutlined />} block>
                            Chọn Favicon
                          </Button>
                        </Upload>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label="Tiền tệ" name="site_currency">
                        <Select>
                          <Select.Option value="VND">
                            VNĐ - Việt Nam Đồng
                          </Select.Option>
                          <Select.Option value="USD">
                            USD - Dollar
                          </Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label="Ngôn ngữ chính" name="site_language">
                        <Select>
                          <Select.Option value="vi">Tiếng Việt</Select.Option>
                          <Select.Option value="en">English</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: "payment",
              label: (
                <span>
                  <CreditCardOutlined /> Thanh toán
                </span>
              ),
              children: (
                <div className="p-3">
                  <Row gutter={24}>
                    <Col span={8}>
                      <Form.Item
                        label="Thanh toán mặc định"
                        name="default_payment_method"
                      >
                        <Select>
                          <Select.Option value="COD">
                            Thanh toán khi nhận hàng (COD)
                          </Select.Option>
                          <Select.Option value="VNPay">
                            VNPay Online
                          </Select.Option>
                          <Select.Option value="Momo">Ví Momo</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="Phí vận chuyển mặc định (VNĐ)"
                        name="shipping_fee"
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Thuế VAT (%)" name="tax_rate">
                        <InputNumber
                          style={{ width: "100%" }}
                          min={0}
                          max={100}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: "advanced",
              label: (
                <span>
                  <SettingOutlined /> Hệ thống
                </span>
              ),
              children: (
                <div className="p-3">
                  <Row gutter={48}>
                    <Col span={8}>
                      <Card size="small" title="Bảo trì Admin">
                        <Form.Item name="maintenance_mode">
                          <Select>
                            <Select.Option value="true">
                              Đang bảo trì (Chỉ xem)
                            </Select.Option>
                            <Select.Option value="false">
                              Hoạt động bình thường
                            </Select.Option>
                          </Select>
                        </Form.Item>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small" title="Bảo trì Website">
                        <Form.Item name="maintenance_mode_website">
                          <Select>
                            <Select.Option value="true">
                              Bật chế độ bảo trì
                            </Select.Option>
                            <Select.Option value="false">
                              Tắt (Công khai)
                            </Select.Option>
                          </Select>
                        </Form.Item>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small" title="Đăng ký tài khoản">
                        <Form.Item name="registration_enabled">
                          <Select>
                            <Select.Option value="true">
                              Cho phép khách đăng ký
                            </Select.Option>
                            <Select.Option value="false">
                              Khóa đăng ký mới
                            </Select.Option>
                          </Select>
                        </Form.Item>
                      </Card>
                    </Col>
                  </Row>
                </div>
              ),
            },
          ]}
        />

        <div className="mt-4 text-end">
          <Space size="middle">
            <Text type="secondary">
              <InfoCircleOutlined /> Mọi thay đổi sẽ áp dụng ngay sau khi lưu.
            </Text>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              loading={saving}
              onClick={() => form.submit()}
              style={{
                background: "#52c41a",
                borderColor: "#52c41a",
                minWidth: 200,
              }}
            >
              Lưu tất cả cấu hình
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default SettingsPage;
