import React, { useEffect, useState } from "react";
import {
  Tab,
  Tabs,
  Form,
  Button,
  Row,
  Col,
  Spinner,
  InputGroup,
  Card,
  Image,
} from "react-bootstrap";
import { getSettingsAPI, updateSettingsWithFilesAPI } from "../api/settingsApi";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const SettingsPage = () => {
  const URL_WEB = process.env.REACT_APP_WEB_URL; // Cập nhật URL nếu khác
  const [settings, setSettings] = useState({
    smtp_host: "",
    smtp_port: "",
    smtp_username: "",
    smtp_password: "",
    smtp_secure: "true",
    email_from_name: "",
    email_from_address: "",
    site_name: "",
    site_description: "",
    site_logo: "",
    site_favicon: "",
    site_currency: "VND",
    site_language: "vi",
    default_payment_method: "COD",
    shipping_fee: 0,
    tax_rate: 0,
    maintenance_mode: "false",
    registration_enabled: "true",
    maintenance_mode_website: "false",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [files, setFiles] = useState({ site_logo: null, site_favicon: null });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await getSettingsAPI();
        setSettings((prev) => ({ ...prev, ...data }));
      } catch (err) {
        showErrorToast("Lỗi khi lấy cấu hình:", err.message || err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    setFiles((prev) => ({ ...prev, [fieldName]: file }));
    // hiển thị tạm thời
    setSettings((prev) => ({
      ...prev,
      [fieldName]: URL.createObjectURL(file),
    }));
  };

const handleSave = async () => {
  setSaving(true);
  try {
    const formData = new FormData();
    Object.keys(settings).forEach((key) => {
      if (!["site_logo", "site_favicon"].includes(key)) {
        formData.append(key, settings[key]);
      }
    });
    if (files.site_logo) formData.append("site_logo", files.site_logo);
    if (files.site_favicon) formData.append("site_favicon", files.site_favicon);

    await updateSettingsWithFilesAPI(formData);
    showSuccessToast("Cập nhật cấu hình thành công!");

    window.location.reload();
  } catch (err) {
    showErrorToast("Lỗi khi lưu cấu hình:", err.message || err);
  } finally {
    setSaving(false);
  }
};


  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const cardStyle = {
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    marginBottom: "20px",
    backgroundColor: "#f9f9f9",
  };

  return (
    <div className="container-fluid my-4" style={{ paddingLeft: "35px" }}>
      <h4 className="fw-bold text-primary mb-4">⚙️ Cấu hình hệ thống</h4>

      <Tabs defaultActiveKey="smtp" id="settings-tabs" className="mb-3" fill variant="pills">
        {/* SMTP / Email */}
        <Tab eventKey="smtp" title="📧 SMTP / Email">
          <Card style={cardStyle}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>SMTP Host</Form.Label>
                  <Form.Control
                    type="text"
                    name="smtp_host"
                    value={settings.smtp_host}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>SMTP Port</Form.Label>
                  <Form.Control
                    type="number"
                    name="smtp_port"
                    value={settings.smtp_port}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>SMTP Secure</Form.Label>
                  <Form.Select
                    name="smtp_secure"
                    value={settings.smtp_secure}
                    onChange={handleChange}
                  >
                    <option value="true">SSL/TLS</option>
                    <option value="false">None</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>SMTP Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="smtp_username"
                    value={settings.smtp_username}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>SMTP Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="smtp_password"
                      value={settings.smtp_password}
                      onChange={handleChange}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Ẩn" : "Hiện"}
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email From Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="email_from_name"
                    value={settings.email_from_name}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email From Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email_from_address"
                    value={settings.email_from_address}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card>
        </Tab>

        {/* Website */}
        <Tab eventKey="website" title="🌐 Website">
          <Card style={cardStyle}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Tên website</Form.Label>
                  <Form.Control
                    type="text"
                    name="site_name"
                    value={settings.site_name}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Mô tả website</Form.Label>
                  <Form.Control
                    type="text"
                    name="site_description"
                    value={settings.site_description}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Logo Website</Form.Label>
                  {settings.site_logo && (
                    <div className="mb-2">
                      <Image src={`${URL_WEB}${settings.site_logo}`} alt="Logo" height={100} />
                    </div>
                  )}
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, "site_logo")}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>Favicon Website</Form.Label>
                  {settings.site_favicon && (
                    <div className="mb-2">
                      <Image src={`${URL_WEB}${settings.site_favicon}`} alt="Favicon" height={100} />
                    </div>
                  )}
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, "site_favicon")}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>Currency</Form.Label>
                  <Form.Select
                    name="site_currency"
                    value={settings.site_currency}
                    onChange={handleChange}
                  >
                    <option value="VND">VND - Việt Nam Đồng</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>Language</Form.Label>
                  <Form.Select
                    name="site_language"
                    value={settings.site_language}
                    onChange={handleChange}
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                    <option value="fr">French</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card>
        </Tab>

        {/* Thanh toán / Đơn hàng */}
        <Tab eventKey="payment" title="💳 Thanh toán / Đơn hàng">
          <Card style={cardStyle}>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Phương thức thanh toán mặc định</Form.Label>
                  <Form.Select
                    name="default_payment_method"
                    value={settings.default_payment_method}
                    onChange={handleChange}
                  >
                    <option value="COD">COD</option>
                    <option value="VNPay">VNPay</option>
                    <option value="Momo">Momo</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Phí vận chuyển (VNĐ)</Form.Label>
                  <Form.Control
                    type="number"
                    name="shipping_fee"
                    value={settings.shipping_fee}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Thuế VAT (%)</Form.Label>
                  <Form.Control
                    type="number"
                    name="tax_rate"
                    value={settings.tax_rate}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card>
        </Tab>

        {/* Hệ thống / Nâng cao */}
        <Tab eventKey="advanced" title="⚙️ Hệ thống / Nâng cao">
          <Card style={cardStyle}>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Bật chế độ bảo trì Trang quản trị</Form.Label>
                  <Form.Select
                    name="maintenance_mode"
                    value={settings.maintenance_mode}
                    onChange={handleChange}
                  >
                    <option value="false">Tắt</option>
                    <option value="true">Bật</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Bật chế độ bảo trì WebSite Âm Sắc Việt</Form.Label>
                  <Form.Select
                    name="maintenance_mode_website"
                    value={settings.maintenance_mode_website}
                    onChange={handleChange}
                  >
                    <option value="false">Tắt</option>
                    <option value="true">Bật</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Cho phép đăng ký tài khoản</Form.Label>
                  <Form.Select
                    name="registration_enabled"
                    value={settings.registration_enabled}
                    onChange={handleChange}
                  >
                    <option value="true">Có</option>
                    <option value="false">Không</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card>
        </Tab>
      </Tabs>

      <div className="text-end mt-3">
        <Button variant="success" onClick={handleSave} disabled={saving}>
          {saving ? "Đang lưu..." : "💾 Lưu tất cả cấu hình"}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
