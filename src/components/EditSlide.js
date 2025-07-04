import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import { FaImage } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { getSlideById, updateSlide } from "../api/slideApi"; // Hàm API lấy slide và update slide
import { ClipLoader } from "react-spinners"; // Import ClipLoader
import { showSuccessToast ,showErrorToast} from "../ultis/toastUtils";

const EditSlide = () => {
  const [slideData, setSlideData] = useState({
    title: "",
    image: null,
    link: "",
    status: "",
    position: "",
    display_area: "",
    start_date: "",
    end_date: "",
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy id từ URL

  // Lấy thông tin slide khi component mount
  useEffect(() => {
    const fetchSlide = async () => {
      try {
        setIsLoading(true); // Hiển thị loading khi fetch dữ liệu
        const data = await getSlideById(id);
        setSlideData(data);
      } catch (error) {
        showErrorToast("Slide","Lỗi khi tải thông tin slide.");
      } finally {
        setIsLoading(false); // Dừng loading khi hoàn thành
      }
    };

    fetchSlide();
  }, [id]);

  const handleFieldChange = (field, value) => {
    setSlideData({ ...slideData, [field]: value });
  };

  const handleFileChange = (e) => {
    setSlideData({ ...slideData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("title", slideData.title);
      formData.append("image", slideData.image);
      formData.append("link", slideData.link);
      formData.append("status", slideData.status);
      formData.append("position", slideData.position);
      formData.append("display_area", slideData.display_area);
      formData.append("start_date", slideData.start_date);
      formData.append("end_date", slideData.end_date);

      await updateSlide(id, formData); // Gửi dữ liệu lên API để update slide
      showSuccessToast("Slide","Slide đã được cập nhật thành công!");
      setTimeout(() => {
        setIsLoading(false);
        navigate("/slide-banner/danh-sach"); // Chuyển hướng về trang danh sách slide
      }, 2000);
    } catch (error) {
      showErrorToast("Slide"," Có lỗi khi cập nhật slide.");
    }
  };

  return (
    <div className="container mt-5">
      <h4 className="text-primary mb-4 text-center">Sửa Slide</h4>
      {/* {message && <div className="alert alert-info">{message}</div>} */}
      {isLoading ? (
        <div className="loading-container d-flex justify-content-center">
          <ClipLoader color="#3498db" loading={isLoading} size={50} />
        </div>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Tên Slide</Form.Label>
                <Form.Control
                  type="text"
                  value={slideData.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  required
                  placeholder="Nhập tên Slide"
                  className="shadow-sm"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Liên kết</Form.Label>
                <Form.Control
                  type="text"
                  value={slideData.link}
                  onChange={(e) => handleFieldChange("link", e.target.value)}
                  className="shadow-sm"
                  placeholder="Nhập liên kết"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Hình ảnh</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    className="shadow-sm"
                  />
                  <Button
                    variant="outline-secondary"
                    className="input-group-text"
                    disabled
                  >
                    <FaImage />
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Vị trí</Form.Label>
                <Form.Control
                  type="text"
                  value={slideData.position}
                  onChange={(e) =>
                    handleFieldChange("position", e.target.value)
                  }
                  className="shadow-sm"
                  placeholder="Nhập vị trí"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Khu vực hiển thị</Form.Label>
                <Form.Select
                  value={slideData.display_area || ""}
                  onChange={(e) =>
                    handleFieldChange("display_area", e.target.value)
                  }
                  className="shadow-sm"
                >
                  <option value="">Chọn khu vực hiển thị</option>
                  <option value="home">Banner Trang chủ</option>
                  <option value="popup">BST</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="footer">Footer</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
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
            className="mt-4 w-100"
            variant="primary"
            type="submit"
            size="lg"
            style={{
              boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
              fontWeight: "bold",
            }}
          >
            Sửa Slide
          </Button>
        </Form>
      )}
    </div>
  );
};

export default EditSlide;
