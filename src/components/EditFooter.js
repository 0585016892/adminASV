import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFooterById, updateFooter } from "../api/footerApi";
import { useForm, Controller } from "react-hook-form";
import { Form, Button, Row, Col, Card, Alert } from "react-bootstrap";
import { ClipLoader } from "react-spinners";
const EditFooter = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  useEffect(() => {
    const fetchFooter = async () => {
      setLoading(true);
      try {
        const productData = await getFooterById(id);
        setValue("title", productData.title);
        setValue("label", productData.label);
        setValue("status", productData.status);
      } catch (error) {
        setErrorMessage(error.message || "Lỗi khi lấy thông tin.");
        console.error("Lỗi khi lấy thông tin:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooter();
  }, [id, setValue]);

  const onSubmit = async (data) => {
    const jsonData = {
      title: data.title || "",
      label: data.label || "",
      status: data.status || "",
    };

    try {
      setIsLoading(true);
      const result = await updateFooter(id, jsonData);
      setErrorMessage("✅ Thêm danh mục thành công!");

      setTimeout(() => {
        setIsLoading(false); // Dừng loading sau 2 giây

        navigate("/footer/danh-sach");
      }, 2000);
      if (result && result.success) {
      } else {
        throw new Error(result.message || "Có lỗi xảy ra khi sửa sản phẩm.");
      }
    } catch (error) {
      setErrorMessage(error.message || "Có lỗi xảy ra khi sửa sản phẩm.");
      console.error("Lỗi khi sửa sản phẩm:", error);
    }
  };
  return (
    <div className="container mt-4">
      <h3 className="mb-4">Sửa Footer</h3>
      {errorMessage && <div className="alert alert-info">{errorMessage}</div>}
      {isLoading ? (
        <div className="loading-container d-flex justify-content-center">
          <ClipLoader color="#3498db" loading={isLoading} size={50} />
        </div>
      ) : (
        <Card>
          <Card.Body>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="title">
                    <Form.Label>Tiêu đề</Form.Label>
                    <Controller
                      control={control}
                      name="title"
                      rules={{ required: "Tên tiêu đề là bắt buộc" }}
                      render={({ field }) => (
                        <Form.Control
                          {...field}
                          type="text"
                          placeholder="Nhập tên tiêu đề"
                          isInvalid={!!errors.title}
                        />
                      )}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.title?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="label">
                    <Form.Label>Liên kết</Form.Label>
                    <Controller
                      control={control}
                      name="label"
                      rules={{ required: "Liên kết là bắt buộc" }}
                      render={({ field }) => (
                        <Form.Control
                          {...field}
                          type="text"
                          placeholder="Nhập liên kết"
                          isInvalid={!!errors.label}
                        />
                      )}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.label?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="status">
                    <Form.Label>Trạng thái</Form.Label>
                    <Controller
                      control={control}
                      name="status"
                      rules={{ required: "Trạng thái là bắt buộc" }}
                      render={({ field }) => (
                        <Form.Control
                          {...field}
                          as="select"
                          isInvalid={!!errors.status}
                        >
                          <option value="active">Kích hoạt</option>
                          <option value="inactive">Không kích hoạt</option>
                        </Form.Control>
                      )}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.status?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Button variant="primary" type="submit" className="w-100">
                Cập nhật danh mục
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default EditFooter;
