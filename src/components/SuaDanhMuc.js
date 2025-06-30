import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDanhMucById, updateDanhMuc } from "../api/danhmucApi";
import { useForm, Controller } from "react-hook-form";
import { Form, Button, Row, Col, Card, Alert } from "react-bootstrap";
import { ClipLoader } from "react-spinners";
const SuaDanhMuc = () => {
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
    const fetchDanhMuc = async () => {
      setLoading(true);
      try {
        const productData = await getDanhMucById(id);
        setValue("name", productData.name);
        setValue("slug", productData.slug);
        setValue("status", productData.status);
        setValue("description", productData.description);
      } catch (error) {
        setErrorMessage(error.message || "Lỗi khi lấy sản phẩm.");
        console.error("Lỗi khi lấy sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDanhMuc();
  }, [id, setValue]);

  const onSubmit = async (data) => {
    const jsonData = {
      name: data.name || "",
      slug: data.slug || "",
      status: data.status || "",
      description: data.description || "",
    };

    try {
      setIsLoading(true);
      const result = await updateDanhMuc(id, jsonData);
      setTimeout(() => {
        setIsLoading(false); // Dừng loading sau 2 giây
        navigate("/danh-muc/danh-sach");
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
    <div className="container-fluid my-4" style={{ paddingLeft: "35px" }}>
      <h3 className="mb-4">Sửa danh mục</h3>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
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
                  <Form.Group controlId="name">
                    <Form.Label>Tên danh mục</Form.Label>
                    <Controller
                      control={control}
                      name="name"
                      rules={{ required: "Tên danh mục là bắt buộc" }}
                      render={({ field }) => (
                        <Form.Control
                          {...field}
                          type="text"
                          placeholder="Nhập tên danh mục"
                          isInvalid={!!errors.name}
                        />
                      )}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="slug">
                    <Form.Label>Slug</Form.Label>
                    <Controller
                      control={control}
                      name="slug"
                      rules={{ required: "Slug là bắt buộc" }}
                      render={({ field }) => (
                        <Form.Control
                          {...field}
                          type="text"
                          placeholder="Nhập slug"
                          isInvalid={!!errors.slug}
                        />
                      )}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.slug?.message}
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
                <Col md={6}>
                  <Form.Group controlId="description">
                    <Form.Label>Mô tả</Form.Label>
                    <Controller
                      control={control}
                      name="description"
                      rules={{ required: "Mô tả là bắt buộc" }}
                      render={({ field }) => (
                        <Form.Control
                          {...field}
                          as="textarea"
                          rows={3}
                          placeholder="Nhập mô tả danh mục"
                          isInvalid={!!errors.description}
                        />
                      )}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.description?.message}
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

export default SuaDanhMuc;
