import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  FloatingLabel,
  Alert,
  Spinner,
} from "react-bootstrap";
import { createPost, updatePost } from "../api/postAPI";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const PostModal = ({
  show,
  onHide,
  initialData = null,
  onSuccess,
  loading = false,
}) => {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    content: "",
    status: "draft",
    images: [],
    image: null, // ✅ ảnh chính là File, không phải string
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        category: initialData.category || "",
        content: initialData.content || "",
        status: initialData.status || "draft",
        images: [], // Không load ảnh cũ vào form, chỉ khi upload mới
        image:initialData.image,
      });
    } else {
      setFormData({
        title: "",
        category: "",
        content: "",
        status: "draft",
        images: [],
        image: '',
      });
    }
    setMessage("");
  }, [initialData]);
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "title") {
      const autoSlug = generateSlug(value);
      setFormData((prev) => ({
        ...prev,
        title: value,
        slug: autoSlug,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, images: Array.from(e.target.files) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("category", formData.category);
      data.append("content", formData.content);
      data.append("status", formData.status);
      data.append("slug", formData.slug);
      if (formData.image) {
        data.append("image", formData.image); // ảnh chính
      }
      formData.images.forEach((img) => data.append("images", img));

      let res; // ✅ Khai báo đúng chỗ

      if (isEditMode) {
        res = await updatePost(initialData.id, data);
      } else {
        res = await createPost(data);
      }

      setMessage("✅ Lưu thành công!");
      onSuccess(); // load lại danh sách
      showSuccessToast(
        "Tin tức blog",
        isEditMode
          ? "Cập nhật bài viết thành công!"
          : "Thêm bài viết thành công!"
      );
      onHide(); // đóng modal
    } catch (err) {
      console.error("Lỗi gửi dữ liệu:", err.response?.data || err);
      setMessage("❌ Lỗi khi lưu bài viết.");
    }
  };

  const generateSlug = (text) => {
    return text
      .normalize("NFD") // Tách dấu ra
      .replace(/[\u0300-\u036f]/g, "") // Bỏ dấu
      .replace(/Đ/g, "D") // Đổi Đ thành D (hoặc "" nếu muốn bỏ luôn)
      .replace(/đ/g, "d") // Đổi đ thành d
      .replace(/[^a-zA-Z0-9 ]/g, "") // Bỏ ký tự đặc biệt
      .trim()
      .replace(/\s+/g, "-"); // Thay khoảng trắng bằng "-"
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditMode ? "✏️ Sửa bài viết" : "➕ Thêm bài viết"}
        </Modal.Title>
      </Modal.Header>
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: 200 }}
        >
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
        </div>
      ) : (
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Modal.Body>
            {message && <Alert variant="info">{message}</Alert>}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
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
                <Form.Group className="mb-3">
                  <Form.Label>Slug (tự động tạo)</Form.Label>
                  <Form.Control
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    readOnly // hoặc cho phép sửa nếu muốn
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Danh mục</Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="VD: Xu hướng, phối đồ"
                  />
                </Form.Group>
              </Col>
            </Row>

            <FloatingLabel label="Nội dung" className="mb-3">
              <Form.Control
                as="textarea"
                name="content"
                value={formData.content}
                onChange={handleChange}
                style={{ height: "120px" }}
                required
              />
            </FloatingLabel>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="draft">Nháp</option>
                    <option value="published">Hiển thị</option>
                  </Form.Select>
                </Form.Group>
              </Col>

<<<<<<< HEAD
                          <Col md={6}>
                              <Form.Group className="mb-3">
                                  <Form.Label>Hình ảnh (nhiều ảnh)</Form.Label>
                                  <Form.Control
                                      type="file"
                                      multiple
                                      accept="image/*"
                                      onChange={handleFileChange}
                                  />
                              </Form.Group>
                          </Col>
                          <Col md={6}>
                          <Form.Group className="mb-3">
                              <Form.Label>Hình ảnh chính</Form.Label>
                              <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleMainImageChange}
                              />
                              {/* 👉 Hiển thị ảnh đã có nếu đang ở chế độ sửa */}
                              {isEditMode && initialData.image && (
                                <img
                                  src={`https://finlyapi-production.up.railway.app${initialData.image}`}
                                  alt="Ảnh hiện tại"
                                  style={{ maxWidth: "100%", marginTop: 10 }}
                                />
                              )}
                            </Form.Group>
                          </Col>
                      </Row>
                  </Modal.Body>
                  <Modal.Footer>
                      <Button variant="secondary" onClick={onHide}>
                          Đóng
                      </Button>
                      <Button type="submit" variant="primary">
                          {isEditMode ? "Cập nhật" : "Thêm"}
                      </Button>
                  </Modal.Footer>
              </Form>
          )}
=======
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hình ảnh (nhiều ảnh)</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
              Đóng
            </Button>
            <Button type="submit" variant="primary">
              {isEditMode ? "Cập nhật" : "Thêm"}
            </Button>
          </Modal.Footer>
        </Form>
      )}
>>>>>>> 49e23134a34bd1d461270ee508535b7f07f02f4f
    </Modal>
  );
};

export default PostModal;
