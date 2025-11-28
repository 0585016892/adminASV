import React, { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { Button, Form, Row, Col, Card } from "react-bootstrap";
import { addDanhmuc, getParentCategories } from "../api/danhmucApi";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { showSuccessToast ,showErrorToast} from "../ultis/toastUtils";
import { useAuth } from "../contexts/AuthContext";

const stripHtml = (html) => html.replace(/<[^>]*>/g, "").trim();
const removeVietnameseTones = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};
const generateSlug = (text) =>
  removeVietnameseTones(stripHtml(text))
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const DanhMucAdd = () => {
  const { user } = useAuth();
  const [parentId, setParentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState([]);
  const navigate = useNavigate();
  const [danhMucData, setDanhMucData] = useState({
    name: "",
    slug: "",
    description: "",
    status: "",
    parent_id: null,
  });

  // Fetch danh mục cha
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getParentCategories();
        setParentCategories(response.categories); // Lưu mã giảm giá vào state
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const updatedParentId =
      parentId === "" || isNaN(Number(parentId)) ? null : Number(parentId);
    setDanhMucData((prevData) => ({
      ...prevData,
      parent_id: updatedParentId,
    }));
  }, [parentId]);

  const handleFieldChange = (field, value) => {
    const newData = { ...danhMucData, [field]: value };
    if (field === "name") {
      newData.slug = generateSlug(value);
    }
    setDanhMucData(newData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const dataToSend = {
        name: danhMucData.name,
        slug: danhMucData.slug,
        status: danhMucData.status,
        description: danhMucData.description,
        parent_id: danhMucData.parent_id,
        userID:user.id
      };
      await addDanhmuc(dataToSend);
      showSuccessToast("Danh mục","Thêm danh mục thành công!");
      setDanhMucData({
        name: "",
        slug: "",
        status: "",
        description: "",
        parent_id: null,
      });
      setTimeout(() => {
        setIsLoading(false);
        navigate("/danh-muc/danh-sach");
      }, 2000);
    } catch (error) {
      showErrorToast("Danh mục","Có lỗi khi thêm danh mục.");
    }
  };

  return (
    <div className="container-fluid my-4" style={{ paddingLeft: "35px" }}>
      <h4 className="mb-4 text-center">Thêm Danh Mục</h4>
      <Card>
        <Card.Body>
          {isLoading ? (
            <div className="loading-container d-flex justify-content-center">
              <ClipLoader color="#3498db" loading={isLoading} size={50} />
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Tên danh mục</Form.Label>
                    <Form.Control
                      type="text"
                      value={danhMucData.name}
                      onChange={(e) =>
                        handleFieldChange("name", e.target.value)
                      }
                      required
                      placeholder="Nhập tên danh mục"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Slug (tự động)</Form.Label>
                    <Form.Control
                      type="text"
                      value={danhMucData.slug}
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mt-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Control
                      as="select"
                      value={danhMucData.status}
                      onChange={(e) =>
                        handleFieldChange("status", e.target.value)
                      }
                    >
                      <option value="">-- Chọn chế độ --</option>
                      <option value="active">Hiển thị</option>
                      <option value="inactive">Ẩn</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Danh mục cha (tùy chọn)</Form.Label>
                    <Form.Select
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {parentCategories?.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mt-3">
                <Col>
                  <Form.Group>
                    <Form.Label>Mô tả</Form.Label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={danhMucData.description}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        handleFieldChange("description", data);
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button className="mt-4" variant="primary" type="submit" block>
                Thêm danh mục
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default DanhMucAdd;
