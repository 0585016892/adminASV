import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Row, Col, Card, Tag, Typography, Button, Space, 
  Divider, Image, Descriptions, Spin, ConfigProvider, Breadcrumb ,Tooltip
} from "antd";
import { 
  ArrowLeftOutlined, ShoppingCartOutlined, 
  SafetyCertificateOutlined, AppstoreOutlined,
  CheckCircleOutlined, CloseCircleOutlined
} from "@ant-design/icons";
import { getProductById } from "../api/productAPI";
import { getAllColors } from "../api/colorApi";

const { Title, Text, Paragraph } = Typography;
const URL_WEB = process.env.REACT_APP_WEB_URL;

const SanphamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [colors, setColors] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productData, colorData] = await Promise.all([
          getProductById(id),
          getAllColors(token),
        ]);
        const finalProduct = productData.product || productData;
        setProduct(finalProduct);
        setSelectedImage(finalProduct.image);
        setColors(colorData.data || colorData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]);

  const findColorCode = (colorName) => {
    const matched = colors.find(
      (c) => c.name.toLowerCase().trim() === colorName.toLowerCase().trim()
    );
    return matched ? matched.code : "#ccc";
  };

  if (loading || !product)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spin size="large" tip="Đang tải giai điệu..." />
      </div>
    );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#5d4037",
          borderRadius: 16,
        },
      }}
    >
      <div className="container-fluid p-4">
        <style>{`
          .detail-card { border-radius: 24px; overflow: hidden; border: 1px solid #f0ece1; }
          .thumbnail-img { cursor: pointer; transition: all 0.3s; border-radius: 12px; border: 2px solid transparent; }
          .thumbnail-img.active { border-color: #5d4037; transform: scale(1.05); }
          .main-image-wrapper { background: #fdfcf8; border-radius: 20px; padding: 20px; margin-bottom: 20px; }
          .color-circle { width: 32px; height: 32px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 5px rgba(0,0,0,0.1); cursor: pointer; transition: 0.3s; }
          .color-circle:hover { transform: scale(1.2); }
        `}</style>

        {/* Breadcrumb & Nút quay lại */}
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <Breadcrumb
            items={[
              { title: <a onClick={() => navigate("/")}>Dashboard</a> },
              { title: <a onClick={() => navigate("/san-pham/danh-sach")}>Sản phẩm</a> },
              { title: product.name },
            ]}
          />
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Quay lại</Button>
        </div>

        <Row gutter={[40, 40]}>
          {/* CỘT TRÁI: GALLERY ẢNH */}
          <Col xs={24} lg={10}>
            <div className="main-image-wrapper text-center shadow-sm">
              <Image
                src={`${URL_WEB}/uploads/${selectedImage}`}
                preview={true}
                style={{ maxHeight: 450, objectFit: "contain" }}
              />
            </div>
            
            <Space wrap size={12} className="justify-content-center w-100">
              {[product.image, ...(product.subImages || [])].map((img, idx) => (
                <div 
                  key={idx}
                  className={`thumbnail-img ${selectedImage === img ? "active" : ""}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={`${URL_WEB}/uploads/${img}`}
                    alt="thumbnail"
                    style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10 }}
                  />
                </div>
              ))}
            </Space>
          </Col>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
          <Col xs={24} lg={14}>
            <Card className="detail-card shadow-sm border-0">
              <Space direction="vertical" size={24} className="w-100">
                <div>
                  <Space align="center">
                    <Tag color={product.status === "active" ? "success" : "default"} icon={product.status === "active" ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
                      {product.status === 'active' ? 'Đang kinh doanh' : 'Ngừng kinh doanh'}
                    </Tag>
                    <Text type="secondary">Mã SP: SP180703{product.id}</Text>
                  </Space>
                  <Title level={2} style={{ marginTop: 12, marginBottom: 8 }}>{product.name}</Title>
                  <Title level={3} type="danger" style={{ marginTop: 0 }}>
                    {Number(product.price).toLocaleString()} <small>đ</small>
                  </Title>
                </div>

                <Divider className="my-0" />

                <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 1, md: 2, sm: 1, xs: 1 }} className="bg-white">
                  <Descriptions.Item label="Thương hiệu" labelStyle={{ fontWeight: 600 }}>{product.brand}</Descriptions.Item>
                  <Descriptions.Item label="Danh mục" labelStyle={{ fontWeight: 600 }}>
                    <Tag color="volcano">{product.categoryName}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Kích cỡ" labelStyle={{ fontWeight: 600 }}>{product.size}</Descriptions.Item>
                  <Descriptions.Item label="Tồn kho" labelStyle={{ fontWeight: 600 }}>
                    <Text strong style={{ color: product.quantity < 10 ? '#ff4d4f' : '#52c41a' }}>
                      {product.quantity} sản phẩm
                    </Text>
                  </Descriptions.Item>
                  {product.couponCode && (
                    <Descriptions.Item label="Mã ưu đãi" labelStyle={{ fontWeight: 600 }}>
                      <Tag color="cyan" icon={<SafetyCertificateOutlined />}>{product.couponCode}</Tag>
                    </Descriptions.Item>
                  )}
                </Descriptions>

                <div>
                  <Text strong className="d-block mb-3">Màu sắc khả dụng:</Text>
                  <Space size={16}>
                    {product.color?.split(",").map((colorName, idx) => (
                      <Tooltip title={colorName.trim()} key={idx}>
                        <div
                          className="color-circle"
                          style={{ backgroundColor: findColorCode(colorName) }}
                        />
                      </Tooltip>
                    ))}
                  </Space>
                </div>

                <div>
                  <Text strong className="d-block mb-2"><AppstoreOutlined /> Mô tả sản phẩm:</Text>
                  <Paragraph 
                    className="text-secondary" 
                    style={{ whiteSpace: "pre-wrap", lineHeight: '1.8', textAlign: 'justify' }}
                  >
                    {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
                  </Paragraph>
                </div>

                <div className="pt-4">
                  <Space size="middle">
                    <Button type="primary" size="large" icon={<ShoppingCartOutlined />} onClick={() => navigate("/pos")}>
                      Bán tại quầy
                    </Button>
                    <Button size="large" onClick={() => navigate(`/san-pham/sua/${product.id}`)}>
                      Chỉnh sửa thông tin
                    </Button>
                  </Space>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
};

export default SanphamDetail;