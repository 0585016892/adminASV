import React, { useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { FaImage } from "react-icons/fa";

const AddSlide = () => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL; // Cập nhật URL nếu khác

  const [slideData, setSlideData] = useState({
    title: "",
    link: "",
    position: 0,
    status: "active",
    display_area: "home_banner",
    start_date: "2025-01-01",
    end_date: "2025-12-31",
  });

  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFieldChange = (field, value) => {
    setSlideData({ ...slideData, [field]: value });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const formData = new FormData();
      Object.entries(slideData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("image", image);

      await axios.post(`${API_URL}/slides/add`, formData);

      setMessage("✅ Thêm slide thành công!");
      setTimeout(() => {
        navigate("/slide-banner/danh-sach");
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi khi thêm slide.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h4 className="text-primary mb-4">➕ Thêm Slide Mới</h4>
      {message && <div className="alert alert-info">{message}</div>}

      {isLoading ? (
        <div className="d-flex justify-content-center">
          <ClipLoader color="#0d6efd" loading={true} size={50} />
        </div>
      ) : (
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tiêu đề</Form.Label>
                <Form.Control
                  type="text"
                  value={slideData.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  required
                  placeholder="Nhập tiêu đề slide"
                  className="shadow-sm"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Hình ảnh</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  className="shadow-sm"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Liên kết</Form.Label>
                <Form.Control
                  type="text"
                  value={slideData.link}
                  onChange={(e) => handleFieldChange("link", e.target.value)}
                  placeholder="https://example.com"
                  className="shadow-sm"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  value={slideData.status}
                  onChange={(e) => handleFieldChange("status", e.target.value)}
                  className="shadow-sm"
                >
                  <option value="active">Hiển thị</option>
                  <option value="inactive">Ẩn</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Vị trí (số thứ tự)</Form.Label>
                <Form.Control
                  type="number"
                  value={slideData.position}
                  onChange={(e) =>
                    handleFieldChange("position", e.target.value)
                  }
                  className="shadow-sm"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Khu vực hiển thị</Form.Label>
                <Form.Select
                  value={slideData.display_area}
                  onChange={(e) =>
                    handleFieldChange("display_area", e.target.value)
                  }
                  className="shadow-sm"
                >
                  <option value="home_banner">Banner Trang chủ</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="popup">BST</option>
                  <option value="footer">Footer</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Ngày bắt đầu</Form.Label>
                <Form.Control
                  type="date"
                  value={slideData.start_date}
                  onChange={(e) =>
                    handleFieldChange("start_date", e.target.value)
                  }
                  className="shadow-sm"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Ngày kết thúc</Form.Label>
                <Form.Control
                  type="date"
                  value={slideData.end_date}
                  onChange={(e) =>
                    handleFieldChange("end_date", e.target.value)
                  }
                  className="shadow-sm"
                />
              </Form.Group>
            </Col>
          </Row>

          <Button
            className="mt-3"
            variant="primary"
            type="submit"
            size="lg"
            style={{ boxShadow: "0px 4px 15px rgba(0,0,0,0.1)" }}
          >
            <FaImage /> Thêm Slide
          </Button>
        </Form>
      )}
    </div>
  );
};

export default AddSlide;
