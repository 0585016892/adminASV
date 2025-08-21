import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, updateProduct } from "../api/productAPI";
import { useForm, Controller } from "react-hook-form";
import { Form, Button, Row, Col, Card, Alert } from "react-bootstrap";
import { ClipLoader } from "react-spinners";
import { showSuccessToast ,showErrorToast} from "../ultis/toastUtils";

const SuaSanPham = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productData = await getProductById(id);
        setValue("name", productData.name);
        setValue("slug", productData.slug);
        setValue("price", productData.price);
        setValue("status", productData.status);
        setValue("brand", productData.brand);
        setValue("description", productData.description);
        setValue("size", productData.size);
        setValue("color", productData.color);

        if (productData.image) {
          setImagePreview(`/uploads/${productData.image}`);
        }
      } catch (error) {
        setErrorMessage(error.message || "Lỗi khi lấy sản phẩm.");
        console.error("Lỗi khi lấy sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, setValue]);

  const onSubmit = async (data) => {
    const sizeValue = Array.isArray(data.size)
      ? data.size.join(",")
      : data.size || "";
    const colorValue = Array.isArray(data.color)
      ? data.color.join(",")
      : data.color || "";

    const formData = new FormData();
    formData.append("name", data.name || "");
    formData.append("slug", data.slug || "");
    formData.append("price", data.price || "");
    formData.append("status", data.status || "");
    formData.append("brand", data.brand || "");
    formData.append("description", data.description || "");
    formData.append("size", sizeValue);
    formData.append("color", colorValue);

    if (data.image && data.image[0]) {
      formData.append("image", data.image[0]);
    }

    try {
      setIsLoading(true);
      await updateProduct(id, formData);
              showSuccessToast("Sản phẩm","Cập nhật sản phẩm thành công!");
      setTimeout(() => {
        setIsLoading(false); // Dừng loading sau 2 giây
        
        navigate("/san-pham/danh-sach");
      }, 2000);
    } catch (error) {
      setErrorMessage(error.message || "Có lỗi xảy ra khi sửa sản phẩm.");
      console.error("Lỗi khi sửa sản phẩm:", error);
    }
  };


  return (
    <div className="container-fluid my-4" style={{ paddingLeft: "35px" }}>
      <h3 className="mb-4">Sửa sản phẩm</h3>
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
                    <Form.Label>Tên sản phẩm</Form.Label>
                    <Controller
                      control={control}
                      name="name"
                      rules={{ required: "Tên sản phẩm là bắt buộc" }}
                      render={({ field }) => (
                        <Form.Control
                          {...field}
                          type="text"
                          placeholder="Nhập tên sản phẩm"
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
                  <Form.Group controlId="price">
                    <Form.Label>Giá</Form.Label>
                    <Controller
                      control={control}
                      name="price"
                      rules={{ required: "Giá là bắt buộc" }}
                      render={({ field }) => (
                        <Form.Control
                          {...field}
                          type="number"
                          placeholder="Nhập giá sản phẩm"
                          isInvalid={!!errors.price}
                        />
                      )}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.price?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="image">
                    <Form.Label>Hình ảnh</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={handleImageChange}
                      isInvalid={!!errors.image}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.image?.message}
                    </Form.Control.Feedback>
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={`http://localhost:5000${imagePreview}`}
                          alt="Xem trước"
                          style={{ maxHeight: "150px" }}
                        />
                      </div>
                    )}
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
                  <Form.Group controlId="brand">
                    <Form.Label>Thương hiệu</Form.Label>
                    <Controller
                      control={control}
                      name="brand"
                      rules={{ required: "Thương hiệu là bắt buộc" }}
                      render={({ field }) => (
                        <Form.Control
                          {...field}
                          type="text"
                          placeholder="Nhập thương hiệu"
                          isInvalid={!!errors.brand}
                        />
                      )}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.brand?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
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
                          placeholder="Nhập mô tả sản phẩm"
                          isInvalid={!!errors.description}
                        />
                      )}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.description?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="size">
                    <Form.Label>Kích cỡ</Form.Label>
                    <Controller
                      control={control}
                      name="size"
                      rules={{ required: "Kích cỡ là bắt buộc" }}
                      render={({ field }) => (
                        <Form.Control
                          {...field}
                          type="text"
                          placeholder="Nhập kích cỡ (ngăn cách bởi dấu phẩy)"
                          isInvalid={!!errors.size}
                        />
                      )}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.size?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="color">
                    <Form.Label>Màu sắc</Form.Label>
                    <Controller
                      control={control}
                      name="color"
                      rules={{ required: "Màu sắc là bắt buộc" }}
                      render={({ field }) => (
                        <Form.Control
                          {...field}
                          type="text"
                          placeholder="Nhập màu sắc"
                          isInvalid={!!errors.color}
                        />
                      )}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.color?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Button variant="primary" type="submit" className="w-100">
                Cập nhật sản phẩm
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default SuaSanPham;
