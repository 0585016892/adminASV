import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  ListGroup,
  Image,
} from "react-bootstrap";
import { getProductById } from "../api/productAPI";
import { getAllColors } from "../api/colorApi";
const URL_WEB = process.env.REACT_APP_WEB_URL; // Cập nhật URL nếu khác

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
  }, [id]);

  const findColorCode = (colorName) => {
    const matched = colors.find(
      (c) => c.name.toLowerCase().trim() === colorName.toLowerCase().trim()
    );
    return matched ? matched.code : "#ccc";
  };

  if (loading || !product)
    return (
      <div className="text-center mt-5 d-flex justify-content-center align-items-center h-100" >
        <Spinner animation="border" variant="primary" />
      </div>
    );

  return (
    <div className="container-fluid my-4" style={{ paddingLeft: "35px" }}>
      <div className="d-flex align-items-center">
        <h2 className="fw-bold">Chi tiết sản phẩm</h2>
      </div>
      <Row className="gx-5">
        <Col md={4}>
          <div className="border rounded p-3 shadow-sm bg-white">
            <Image
              src={`${URL_WEB}/uploads/${selectedImage}`}
              fluid
              style={{
                borderRadius: "10px",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
            <div className="d-flex flex-wrap gap-2 mt-3 justify-content-center">
              {[product.image, ...(product.subImages || [])].map((img, idx) => (
                <Image
                  key={idx}
                  src={`${URL_WEB}/uploads/${img}`}
                  thumbnail
                  style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "cover",
                    cursor: "pointer",
                    border:
                      selectedImage === img
                        ? "2px solid #0d6efd"
                        : "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          </div>
        </Col>

        <Col md={8}>
          <Card className="border-0 shadow-sm bg-white p-3">
            <Card.Body>
              <h3 className="fw-bold">{product.name}</h3>
              <Badge
                bg={product.status === "active" ? "success" : "secondary"}
                className="mb-3"
              >
                {product.status == 'active' ? 'Đang hoạt động' :'Không hoạt động'}
              </Badge>

              <h4 className="text-danger mb-3">
                {Number(product.price).toLocaleString()} đ
              </h4>

              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Thương hiệu:</strong> {product.brand}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Danh mục:</strong> {product.categoryName}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Kích cỡ:</strong> {product.size}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Số lượng còn:</strong> {product.quantity}
                </ListGroup.Item>
                {product.couponCode && (
                  <ListGroup.Item>
                    <strong>Mã giảm giá:</strong>{" "}
                    <Badge bg="info">{product.couponCode}</Badge>
                  </ListGroup.Item>
                )}
              </ListGroup>

              <div className="mt-3">
                <strong>Màu sắc:</strong>
                <div className="d-flex mt-2 flex-wrap">
                  {product.color?.split(",").map((colorName, idx) => (
                    <div
                      key={idx}
                      title={colorName.trim()}
                      style={{
                        width: "28px",
                        height: "28px",
                        backgroundColor: findColorCode(colorName),
                        marginRight: "8px",
                        borderRadius: "50%",
                        border: "1px solid #aaa",
                      }}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <strong>Mô tả sản phẩm:</strong>
                <p
                  className="text-muted mt-1"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {product.description}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SanphamDetail;
