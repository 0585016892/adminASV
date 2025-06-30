import React, { useEffect, useState } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import {
  addProduct,
  getCategories,
  getCoupons,
  getAllSizes,
  getAllColors,
} from "../api/productAPI";
import { ClipLoader } from "react-spinners";
import { useParams, useNavigate } from "react-router-dom";
import { FaImage, FaTags } from "react-icons/fa";
import { BsFillFileTextFill } from "react-icons/bs";

// Loại bỏ thẻ HTML để sinh slug
const stripHtml = (html) => html.replace(/<[^>]*>/g, "").trim();

// Chuyển tiếng Việt có dấu sang không dấu
const removeVietnameseTones = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

// Sinh slug từ text thuần không dấu
const generateSlug = (text) =>
  removeVietnameseTones(stripHtml(text))
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const DanhSachSanPhamAdd = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [productData, setProductData] = useState({
    name: "",
    slug: "",
    price: "",
    image: null,
    subImages: [],
    status: "",
    brand: "",
    description: "",
    quantity: "",
    size: [],
    color: [],
    categoryId: "",
    couponId: "", // Mã giảm giá đã chọn
  });
  const token = localStorage.getItem("token");

  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]); // Danh sách mã giảm giá
  const [sizes, setSizes] = useState([]);
  const [colorList, setColorList] = useState([]);

  // Lấy danh sách danh mục từ API khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryList = await getCategories(); // Lấy danh mục
        setCategories(categoryList); // Lưu danh mục vào state

        const couponList = await getCoupons(); // Lấy mã giảm giá

        const response = await getAllSizes(token);
        const data = response.data;
        setSizes(data);

        const response_color = await getAllColors(token);
        const data_color = response_color.data;
        setColorList(data_color);

        // Truy cập vào coupons trong đối tượng trả về
        if (couponList && Array.isArray(couponList.coupons)) {
          setCoupons(couponList.coupons); // Lưu mã giảm giá vào state
        } else {
          console.error("Dữ liệu mã giảm giá không phải là mảng:", couponList);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleFieldChange = (field, value) => {
    const newData = { ...productData, [field]: value };
    if (field === "name") {
      newData.slug = generateSlug(value);
    }
    setProductData(newData);
  };
  const handleColorChange = (color) => {
    setProductData((prevData) => {
      const isSelected = prevData.color.some((item) => item.id === color.id);
      const updatedColors = isSelected
        ? prevData.color.filter((item) => item.id !== color.id) // bỏ nếu đã chọn
        : [...prevData.color, { id: color.id, name: color.name }]; // thêm nếu chưa có

      return {
        ...prevData,
        color: updatedColors,
      };
    });
  };

  const handleSizeChange = (a) => {
    const size = [...productData.size];
    if (size.includes(a)) {
      setProductData({
        ...productData,
        size: size.filter((s) => s !== a),
      });
    } else {
      setProductData({ ...productData, size: [...size, a] });
    }
  };

  const handleFileChange = (e) => {
    setProductData({ ...productData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("name", productData.name);
      formData.append("slug", productData.slug);
      formData.append("price", productData.price);
      formData.append("image", productData.image);
      productData.subImages.forEach((file) => {
        formData.append("subImages", file); // ảnh phụ
      });
      formData.append("status", productData.status);
      formData.append("brand", productData.brand);
      formData.append("categoryId", productData.categoryId);
      formData.append("description", productData.description);
      formData.append("quantity", productData.quantity);
      formData.append("size", JSON.stringify(productData.size));
      formData.append(
        "color",
        JSON.stringify(productData.color.map((c) => c.name))
      );
      formData.append("couponId", productData.couponId); // Thêm mã giảm giá vào form data
      await addProduct(formData);
      setMessage("✅ Thêm sản phẩm thành công!");
      setProductData({
        name: "",
        slug: "",
        price: "",
        image: null,
        status: "",
        brand: "",
        description: "",
        quantity: "",
        size: [],
        color: [],
        categoryId: null,
      });
      setTimeout(() => {
        setIsLoading(false); // Dừng loading sau 2 giây
        navigate("/san-pham/danh-sach");
      }, 2000);
    } catch {
      setMessage("❌ Có lỗi khi thêm sản phẩm.");
    }
  };

  return (
    <div className="container-fluid my-4" style={{ paddingLeft: "35px" }}>
      <h4 className="text-primary mb-4">Thêm Sản Phẩm</h4>
      {message && <div className="alert alert-info">{message}</div>}
      {isLoading ? (
        <div className="loading-container d-flex justify-content-center">
          <ClipLoader color="#3498db" loading={isLoading} size={50} />
        </div>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tên sản phẩm</Form.Label>
                <Form.Control
                  type="text"
                  value={productData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  required
                  placeholder="Nhập tên sản phẩm"
                  className="shadow-sm"
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Slug (tự động)</Form.Label>
                <Form.Control
                  type="text"
                  value={productData.slug}
                  readOnly
                  className="shadow-sm"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Danh mục</Form.Label>
                <Form.Control
                  as="select"
                  value={productData.categoryId}
                  onChange={(e) =>
                    handleFieldChange("categoryId", e.target.value)
                  }
                  className="shadow-sm"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Thương hiệu</Form.Label>
                <Form.Control
                  type="text"
                  value={productData.brand}
                  onChange={(e) => handleFieldChange("brand", e.target.value)}
                  className="shadow-sm"
                  placeholder="Nhập tên thương hiệu"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col xs={12} md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Giá sản phẩm</Form.Label>
                <Form.Control
                  type="number"
                  value={productData.price}
                  onChange={(e) => handleFieldChange("price", e.target.value)}
                  required
                  className="shadow-sm"
                  placeholder="Nhập giá sản phẩm"
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Hình ảnh chính</Form.Label>
                <Form.Control
                  type="file"
                  onChange={handleFileChange}
                  required
                  className="shadow-sm"
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Hình ảnh phụ</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      subImages: Array.from(e.target.files),
                    })
                  }
                  className="shadow-sm"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={productData.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                  placeholder="Nhập mô tả sản phẩm"
                  className="shadow-sm"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Control
                  as="select"
                  value={productData.status}
                  onChange={(e) => handleFieldChange("status", e.target.value)}
                  className="shadow-sm"
                >
                  <option value="">-- Chọn chế độ --</option>
                  <option value="active">Hiển thị</option>
                  <option value="inactive">Ẩn</option>
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Size</Form.Label>
                <div>
                  {sizes.map((size) => (
                    <Form.Check
                      key={size.id}
                      inline
                      label={size.name} // ✅ Đúng: hiển thị tên
                      type="checkbox"
                      checked={productData.size.includes(size.name)}
                      onChange={() => handleSizeChange(size.name)}
                      className="shadow-sm"
                      style={{ minWidth: "140px", marginBottom: "5px" }}
                    />
                  ))}
                </div>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group controlId="formColors">
                <Form.Label>Màu sắc</Form.Label>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px 20px", // hàng cách hàng 10px, cột cách 20px
                  }}
                >
                  {colorList.map((color) => (
                    <Form.Check
                      key={color.id}
                      type="checkbox"
                      inline
                      label={
                        <span>
                          <span
                            style={{
                              display: "inline-block",
                              width: 15,
                              height: 15,
                              backgroundColor: color.code,
                              border: "1px solid #ccc",
                              marginRight: 5,
                            }}
                          ></span>
                          {color.name}
                        </span>
                      }
                      checked={
                        Array.isArray(productData.color) &&
                        productData.color.some((item) => item.id === color.id)
                      }
                      onChange={() => handleColorChange(color)}
                      style={{ minWidth: "150px" }} // chỉnh mỗi ô checkbox có cùng độ rộng
                    />
                  ))}
                </div>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Mã giảm giá</Form.Label>
                <Form.Control
                  as="select"
                  value={productData.couponId}
                  onChange={(e) =>
                    handleFieldChange("couponId", e.target.value)
                  }
                  className="shadow-sm"
                >
                  <option value="">Chọn mã giảm giá</option>
                  {coupons.filter(
                    (coupon) =>
                      coupon.status === "active" && coupon.description === "1"
                  ).length > 0 ? (
                    coupons
                      .filter(
                        (coupon) =>
                          coupon.status === "active" &&
                          coupon.description === "1"
                      )
                      .map((coupon) => (
                        <option key={coupon.id} value={coupon.id}>
                          {coupon.code} - {coupon.discount_percent}%
                        </option>
                      ))
                  ) : (
                    <option disabled>Không có mã giảm giá</option>
                  )}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Số lượng sản phẩm</Form.Label>
                <Form.Control
                  type="number"
                  value={productData.quantity}
                  onChange={(e) =>
                    handleFieldChange("quantity", e.target.value)
                  }
                  required
                  className="shadow-sm"
                  placeholder="Nhập số lượng sản phẩm"
                />
              </Form.Group>
            </Col>
          </Row>
          <Button
            className="mt-4 w-100"
            variant="primary"
            type="submit"
            size="lg"
            style={{ boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)" }}
          >
            <FaTags /> Thêm sản phẩm
          </Button>
        </Form>
      )}
    </div>
  );
};

export default DanhSachSanPhamAdd;
