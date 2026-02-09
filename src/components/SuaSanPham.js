import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Form, Input, Button, Row, Col, Card, Select, 
  InputNumber, Upload, Typography, Space, Spin, 
  ConfigProvider, Divider, Breadcrumb 
} from "antd";
import { 
  UploadOutlined, SaveOutlined, ArrowLeftOutlined, 
  EditOutlined, LoadingOutlined 
} from "@ant-design/icons";
import { getProductById, updateProduct } from "../api/productAPI";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const { Title, Text } = Typography;
const { TextArea } = Input;

const SuaSanPham = () => {
  const WEB_URL = process.env.REACT_APP_WEB_URL;
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileList, setFileList] = useState([]);

  // Load dữ liệu sản phẩm
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productData = await getProductById(id);
        
        // Convert string thành mảng cho Select tags
        const sizeArray = productData.size ? productData.size.split(",") : [];
        const colorArray = productData.color ? productData.color.split(",") : [];

        form.setFieldsValue({
          ...productData,
          size: sizeArray,
          color: colorArray,
        });

        if (productData.image) {
          setImagePreview(`${WEB_URL}/uploads/${productData.image}`);
        }
      } catch (error) {
        showErrorToast("Lỗi", "Không thể lấy thông tin sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, form, WEB_URL]);

  // Xử lý khi chọn ảnh mới
  const handleImageChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const onFinish = async (values) => {
    setIsSubmitting(true);
    const formData = new FormData();
    
    // Append các field cơ bản
    Object.keys(values).forEach(key => {
      if (key !== 'image') {
        // Chuyển mảng Size/Color về lại dạng string
        if (Array.isArray(values[key])) {
          formData.append(key, values[key].join(","));
        } else {
          formData.append(key, values[key] || "");
        }
      }
    });

    // Append ảnh nếu có thay đổi
    if (fileList.length > 0) {
      formData.append("image", fileList[0].originFileObj);
    }

    try {
      await updateProduct(id, formData);
      showSuccessToast("Thành công", "Cập nhật sản phẩm hoàn tất!");
      setTimeout(() => navigate("/san-pham/danh-sach"), 1500);
    } catch (error) {
      showErrorToast("Lỗi", error.message || "Có lỗi xảy ra.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
      <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} tip="Đang tải dữ liệu..." />
    </div>
  );

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#5d4037", borderRadius: 12 } }}>
      <div className="container-fluid p-4">
        <style>{`
          .edit-card { border-radius: 20px; border: 1px solid #f0ece1; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
          .image-preview-box { width: 100%; height: 250px; border: 2px dashed #d9d9d9; border-radius: 15px; display: flex; justify-content: center; align-items: center; overflow: hidden; background: #fafafa; }
          .ant-form-item-label label { font-weight: 600; color: #555; }
        `}</style>

        {/* Breadcrumb & Header */}
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <Breadcrumb
            items={[
              { title: "Dashboard" },
              { title: <a onClick={() => navigate("/san-pham/danh-sach")}>Sản phẩm</a> },
              { title: "Chỉnh sửa" },
            ]}
          />
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Quay lại</Button>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark="optional">
          <Row gutter={24}>
            {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
            <Col xs={24} lg={16}>
              <Card className="edit-card mb-4">
                <Title level={4} className="mb-4"><EditOutlined /> Thông tin cơ bản</Title>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                      <Input size="large" placeholder="Ví dụ: Giày Sneaker Acoustic" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="slug" label="Đường dẫn (Slug)" rules={[{ required: true }]}>
                      <Input size="large" placeholder="giay-sneaker-acoustic" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="price" label="Giá bán (VNĐ)" rules={[{ required: true }]}>
                      <InputNumber 
                        className="w-100" size="large" 
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="brand" label="Thương hiệu" rules={[{ required: true }]}>
                      <Input size="large" placeholder="Nhập hãng sản xuất" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="description" label="Mô tả chi tiết">
                  <TextArea rows={6} placeholder="Nhập đặc điểm nổi bật của sản phẩm..." />
                </Form.Item>
              </Card>

              <Card className="edit-card">
                <Title level={4} className="mb-4">Phân loại & Thuộc tính</Title>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="size" label="Kích cỡ (Size)" help="Gõ và nhấn Enter để thêm">
                      <Select mode="tags" size="large" placeholder="38, 39, 40..." style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="color" label="Màu sắc" help="Gõ và nhấn Enter để thêm">
                      <Select mode="tags" size="large" placeholder="Trắng, Đen, Nâu..." style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* CỘT PHẢI: TRẠNG THÁI & HÌNH ẢNH */}
            <Col xs={24} lg={8}>
              <Card className="edit-card mb-4">
                <Title level={4} className="mb-4">Trạng thái</Title>
                <Form.Item name="status" label="Hiển thị sản phẩm">
                  <Select size="large">
                    <Select.Option value="active">Đang kinh doanh (Active)</Select.Option>
                    <Select.Option value="inactive">Tạm ẩn (Inactive)</Select.Option>
                  </Select>
                </Form.Item>
                <Divider />
                <Button 
                  type="primary" 
                  size="large" 
                  block 
                  icon={<SaveOutlined />} 
                  htmlType="submit" 
                  loading={isSubmitting}
                  style={{ height: 50, fontSize: 16 }}
                >
                  LƯU THAY ĐỔI
                </Button>
              </Card>

              <Card className="edit-card text-center">
                <Title level={4} className="mb-4">Hình ảnh đại diện</Title>
                <div className="image-preview-box mb-3">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Text type="secondary">Chưa có ảnh</Text>
                  )}
                </div>
                <Upload
                  listType="picture"
                  beforeUpload={() => false} // Không upload ngay
                  maxCount={1}
                  onChange={handleImageChange}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />} size="large">Thay đổi ảnh</Button>
                </Upload>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </ConfigProvider>
  );
};

export default SuaSanPham;