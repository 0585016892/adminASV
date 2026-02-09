import React, { useEffect, useState } from "react";
import { 
  Form, Input, Button, Row, Col, Card, Select, 
  InputNumber, Upload, Typography, Space, Checkbox, 
  Divider, ConfigProvider, Breadcrumb, Spin 
} from "antd";
import { 
  PlusOutlined, UploadOutlined, InfoCircleOutlined, 
  DatabaseOutlined, PictureOutlined, LoadingOutlined 
} from "@ant-design/icons";
import {
  addProduct, getCategories, getCoupons,
  getAllSizes, getAllColors,
} from "../api/productAPI";
import { useNavigate } from "react-router-dom";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";
import { useAuth } from "../contexts/AuthContext";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Helper: Chuyển tiếng Việt có dấu sang không dấu & tạo slug
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

const DanhSachSanPhamAdd = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colorList, setColorList] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catList, coupList, sizeRes, colorRes] = await Promise.all([
          getCategories(),
          getCoupons(),
          getAllSizes(token),
          getAllColors(token)
        ]);

        setCategories(catList);
        setSizes(sizeRes.data || []);
        setColorList(colorRes.data || []);
        if (coupList?.coupons) setCoupons(coupList.coupons);
      } catch (error) {
        showErrorToast("Lỗi", "Không thể tải dữ liệu khởi tạo.");
      }
    };
    fetchData();
  }, [token]);

  // Xử lý tự động sinh Slug
  const handleNameChange = (e) => {
    const name = e.target.value;
    form.setFieldsValue({ slug: generateSlug(name) });
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Append các field cơ bản
      formData.append("name", values.name);
      formData.append("slug", values.slug);
      formData.append("price", values.price);
      formData.append("brand", values.brand || "");
      formData.append("categoryId", values.categoryId);
      formData.append("description", values.description || "");
      formData.append("quantity", values.quantity);
      formData.append("status", values.status);
      formData.append("userId", user.id);
      if (values.couponId) formData.append("couponId", values.couponId);

      // Xử lý Size & Color (Convert mảng sang JSON string cho API)
      formData.append("size", JSON.stringify(values.size || []));
      formData.append("color", JSON.stringify(values.color || []));

      // Append File
      if (values.image?.file) {
        formData.append("image", values.image.file);
      }
      if (values.subImages?.fileList) {
        values.subImages.fileList.forEach(item => {
          formData.append("subImages", item.originFileObj);
        });
      }

      await addProduct(formData);
      showSuccessToast("Thành công", "Đã thêm sản phẩm mới vào cửa hàng!");
      setTimeout(() => navigate("/san-pham/danh-sach"), 1500);
    } catch (error) {
      showErrorToast("Lỗi", "Có lỗi khi thêm sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#5d4037", borderRadius: 12 } }}>
      <div className="container-fluid p-4">
        <style>{`
          .add-card { border-radius: 16px; border: 1px solid #f0ece1; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
          .section-title { color: #5d4037; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
          .ant-form-item-label label { font-weight: 600; }
        `}</style>

        <Breadcrumb className="mb-3" items={[{ title: "Quản lý" }, { title: "Sản phẩm" }, { title: "Thêm mới" }]} />
        <Title level={3} className="mb-4">Tạo sản phẩm mới</Title>

        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: 'active' }}>
          <Row gutter={24}>
            {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
            <Col xs={24} lg={16}>
              <Card className="add-card">
                <Title level={5} className="section-title"><InfoCircleOutlined /> Thông tin chung</Title>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}>
                      <Input size="large" onChange={handleNameChange} placeholder="Tên sản phẩm..." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="slug" label="Slug (Tự động)">
                      <Input size="large" readOnly className="bg-light" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
                      <Select size="large" placeholder="Chọn danh mục">
                        {categories.map(cat => <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="brand" label="Thương hiệu">
                      <Input size="large" placeholder="Ví dụ: Nike, Adidas..." />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="description" label="Mô tả">
                  <TextArea rows={4} placeholder="Nhập mô tả sản phẩm..." />
                </Form.Item>
              </Card>

              <Card className="add-card">
                <Title level={5} className="section-title"><DatabaseOutlined /> Thuộc tính sản phẩm</Title>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item name="size" label="Kích cỡ khả dụng">
                      <Checkbox.Group className="w-100">
                        <Row>
                          {sizes.map(s => (
                            <Col span={6} key={s.id} className="mb-2">
                              <Checkbox value={s.name}>{s.name}</Checkbox>
                            </Col>
                          ))}
                        </Row>
                      </Checkbox.Group>
                    </Form.Item>
                  </Col>
                  <Divider />
                  <Col span={24}>
                    <Form.Item name="color" label="Màu sắc khả dụng">
                      <Checkbox.Group className="w-100">
                        <Row>
                          {colorList.map(c => (
                            <Col span={6} key={c.id} className="mb-2">
                              <Checkbox value={c.name}>
                                <Space>
                                  <div style={{ width: 12, height: 12, backgroundColor: c.code, border: '1px solid #ddd' }} />
                                  {c.name}
                                </Space>
                              </Checkbox>
                            </Col>
                          ))}
                        </Row>
                      </Checkbox.Group>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* CỘT PHẢI: GIÁ & HÌNH ẢNH */}
            <Col xs={24} lg={8}>
              <Card className="add-card">
                <Title level={5} className="section-title"><DatabaseOutlined /> Kho hàng & Giá</Title>
                <Form.Item name="price" label="Giá bán (VNĐ)" rules={[{ required: true }]}>
                  <InputNumber 
                    className="w-100" size="large" min={0}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>
                <Form.Item name="quantity" label="Số lượng nhập kho" rules={[{ required: true }]}>
                  <InputNumber className="w-100" size="large" min={1} />
                </Form.Item>
                <Form.Item name="status" label="Trạng thái hiển thị">
                  <Select size="large">
                    <Select.Option value="active">Hiển thị ngay</Select.Option>
                    <Select.Option value="inactive">Ẩn sản phẩm</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="couponId" label="Mã giảm giá áp dụng">
                  <Select size="large" allowClear placeholder="Chọn mã">
                    {coupons.filter(c => c.status === "active").map(c => (
                      <Select.Option key={c.id} value={c.id}>{c.code} (-{c.discount_percent}%)</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Card>

              <Card className="add-card">
                <Title level={5} className="section-title"><PictureOutlined /> Hình ảnh</Title>
                <Form.Item name="image" label="Ảnh đại diện (Bắt buộc)" rules={[{ required: true, message: 'Chọn ảnh chính' }]}>
                  <Upload maxCount={1} listType="picture" beforeUpload={() => false}>
                    <Button icon={<UploadOutlined />} block size="large">Chọn ảnh chính</Button>
                  </Upload>
                </Form.Item>
                <Form.Item name="subImages" label="Ảnh phụ (Nhiều ảnh)">
                  <Upload multiple listType="picture" beforeUpload={() => false}>
                    <Button icon={<PlusOutlined />} block size="large">Thêm ảnh phụ</Button>
                  </Upload>
                </Form.Item>
              </Card>

              <Button 
                type="primary" size="large" block 
                htmlType="submit" loading={loading}
                style={{ height: 50, fontSize: 18, fontWeight: 600 }}
              >
                {loading ? "ĐANG LƯU..." : "HOÀN TẤT THÊM MỚI"}
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </ConfigProvider>
  );
};

export default DanhSachSanPhamAdd;