import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  FloatingLabel,
  Alert,
  Image,
} from "react-bootstrap";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const CollectionModal = ({ show, onHide, onSave, initialData = null }) => {
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    status: "active",
    image: null,
    imagePreview: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        status: initialData.status || "active",
        image: null,
        imagePreview: initialData.image
          ? `${process.env.REACT_APP_WEB_URL}/uploads/${initialData.image}`
          : "",
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        status: "active",
        image: null,
        imagePreview: "",
      });
    }
    setMessage("");
  }, [initialData]);

  const generateSlug = (text) => {
    return text
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/Đ/g, "D")
      .replace(/đ/g, "d")
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: generateSlug(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      setMessage("❌ Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    onSave(formData);  // gửi formData cho cha xử lý API
    onHide(); // đóng modal
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "✏️ Sửa bộ sưu tập" : "➕ Thêm bộ sưu tập"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {message && <Alert variant="danger">{message}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Tên bộ sưu tập</Form.Label>
            <Form.Control
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Slug (tự tạo)</Form.Label>
            <Form.Control name="slug" value={formData.slug} readOnly />
          </Form.Group>

          <FloatingLabel label="Mô tả" className="mb-3">
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={{ height: "100px" }}
              required
            />
          </FloatingLabel>

          <Form.Group className="mb-3">
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select name="status" value={formData.status} onChange={handleChange}>
              <option value="active">Kích hoạt</option>
              <option value="inactive">Ẩn</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ảnh đại diện</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
            {formData.imagePreview && (
              <Image
                src={formData.imagePreview}
                alt="preview"
                className="mt-2"
                fluid
                rounded
                style={{ maxHeight: 150, objectFit: "cover", width: "100%" }}
              />
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Đóng</Button>
          <Button type="submit" variant="primary">
            {isEdit ? "Cập nhật" : "Thêm mới"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CollectionModal;
