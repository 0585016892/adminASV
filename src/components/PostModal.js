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
  const API_URL = process.env.REACT_APP_WEB_URL; // Cập nhật URL nếu khác

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    content: "",
    status: "draft",
    images: [],
    image: null,
  });

  const [message, setMessage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        category: initialData.category || "",
        content: initialData.content || "",
        status: initialData.status || "draft",
        images: [],
        image: initialData.image || null,
      });
    } else {
      setFormData({
        title: "",
        category: "",
        content: "",
        status: "draft",
        images: [],
        image: null,
      });
    }
    setMessage("");
  }, [initialData]);
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
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
    const files = Array.from(e.target.files);
  setFormData((prev) => ({ ...prev, images: files }));

  // Tạo URL preview
  const urls = files.map((file) => URL.createObjectURL(file));
  setPreviewImages(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("slug", formData.slug);
      data.append("category", formData.category);
      data.append("content", formData.content);
      data.append("status", formData.status);
      if (formData.image) {
        data.append("image", formData.image);
      }
      formData.images.forEach((img) => data.append("images", img));

      const res = isEditMode
        ? await updatePost(initialData.id, data)
        : await createPost(data);
        console.log(data);
        
      setMessage("✅ Lưu thành công!");
      showSuccessToast(
        "Tin tức blog",
        isEditMode
          ? "Cập nhật bài viết thành công!"
          : "Thêm bài viết thành công!"
      );
      onSuccess();
      onHide();
    } catch (err) {
      console.error("Lỗi gửi dữ liệu:", err.response?.data || err);
      showErrorToast("Lỗi khi lưu bài viết");
      setMessage("❌ Lỗi khi lưu bài viết.");
    }
  };

  const generateSlug = (text) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/Đ/g, "D")
      .replace(/đ/g, "d")
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };
  useEffect(() => {
    return () => {
      previewImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImages]);
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditMode ? "✏️ Sửa bài viết" : "➕ Thêm bài viết"}
        </Modal.Title>
      </Modal.Header>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
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
                  <Form.Label>Slug</Form.Label>
                  <Form.Control
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    readOnly
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
                    placeholder="VD: Tin tức, thời trang"
                  />
                </Form.Group>
              </Col>
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
                  <Form.Label>Hình ảnh chính</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                  />
                 {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Preview"
                          style={{ maxWidth: "100%", marginTop: 10, borderRadius: 6 }}
                        />
                      ) : isEditMode && initialData.image ? (
                        <img
                          src={`${API_URL}${initialData.image}`}
                          alt="Ảnh hiện tại"
                          style={{ maxWidth: "100%", marginTop: 10, borderRadius: 6 }}
                        />
                      ) : null}

                </Form.Group>
              </Col>

              <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Hình ảnh phụ (nhiều)</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />

                {/* ✅ Hiển thị preview ảnh phụ */}
                {previewImages.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {previewImages.map((imgUrl, idx) => (
                      <img
                        key={idx}
                        src={imgUrl}
                        alt={`Ảnh phụ ${idx + 1}`}
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: "cover",
                          borderRadius: 4,
                          border: "1px solid #ccc",
                        }}
                      />
                    ))}
                  </div>
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
    </Modal>
  );
};

export default PostModal;
