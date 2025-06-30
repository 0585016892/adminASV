import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { getFooterParents, addFooterItem } from "../api/footerApi";
const AddFooter = () => {
  const [formData, setFormData] = useState({
    title: "",
    label: "",
    value: "",
    type: "link",
    parent_id: "",
    status: "active",
  });

  const [parents, setParents] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Lấy danh sách footer cha
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getFooterParents();
        setParents(response.footerP); // Lưu mã giảm giá vào state
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const dataToSend = {
        title: formData.title,
        label: formData.label,
        value: formData.value,
        type: formData.type,
        parent_id: formData.parent_id,
        status: formData.status,
      };
      await addFooterItem(dataToSend);
      setMessage("✅ Thêm danh mục thành công!");
      setFormData({
        title: "",
        label: "",
        value: "",
        type: "",
        parent_id: null,
        status: "",
      });
      setTimeout(() => {
        setIsLoading(false);
        navigate("/footer/danh-sach");
      }, 2000);
    } catch (error) {
      setMessage("❌ Có lỗi khi thêm danh mục.");
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   // Ép kiểu dữ liệu đúng
  //   const dataToSend = {
  //     ...formData,
  //     parent_id: formData.parent_id ? Number(formData.parent_id) : null,
  //     status: Number(formData.status),
  //   };

  //   try {
  //     await axios.post("http://localhost:3000/api/footer/add", dataToSend);
  //     setSuccess("Thêm footer thành công!");
  //     setError("");
  //     setFormData({
  //       title: "",
  //       label: "",
  //       value: "",
  //       type: "",
  //       parent_id: null,
  //       status: "",
  //     });
  //   } catch (err) {
  //     console.error("Lỗi khi thêm footer:", err);
  //     setError("Thêm footer thất bại.");
  //     setSuccess("");
  //   }
  // };

  return (
    <Container>
      <h3 className="my-3">Thêm Footer Item</h3>
      {message && <div className="alert alert-info">{message}</div>}
      {isLoading ? (
        <div className="loading-container d-flex justify-content-center">
          <ClipLoader color="#3498db" loading={isLoading} size={50} />
        </div>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Tiêu đề</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nhãn / Link</Form.Label>
                <Form.Control
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Giá trị (link hoặc nội dung)</Form.Label>
                <Form.Control
                  type="text"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Loại</Form.Label>
                <Form.Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="link">Link</option>
                  <option value="text">Text</option>
                  <option value="group">Group</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Danh mục cha (nếu có)</Form.Label>
                <Form.Select
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={handleChange}
                >
                  <option value="">Không có</option>
                  {parents?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Hiển thị</option>
                  <option value="inactive">Ẩn</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Button type="submit" className="mt-4">
            Thêm mới
          </Button>
        </Form>
      )}
    </Container>
  );
};

export default AddFooter;
