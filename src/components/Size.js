import React, { useEffect, useState } from "react";
import {
  Button,
  Container,
  Table,
  Form,
  Row,
  Col,
  Modal,
  Spinner,
  Pagination,
  Alert,
  OverlayTrigger,
  Tooltip,
  Badge,
} from "react-bootstrap";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  getSizes,
  createSize,
  updateSize,
  deleteSize,
  importSizes,
  getAllSizes,
} from "../api/sizeApi";
import { MdDeleteOutline, MdOutlineAutoFixHigh } from "react-icons/md";

const Size = () => {
  const token = localStorage.getItem("token");
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentSize, setCurrentSize] = useState({
    id: null,
    name: "",
    active: "active",
  });
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [sizeToDelete, setSizeToDelete] = useState(null);
  const [message, setMessage] = useState("");

  const limit = 10;

  const fetchSizes = async () => {
    try {
      setLoading(true);
      const res = await getSizes(token, currentPage, limit);
      setSizes(res.data.data);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Lỗi lấy danh sách size:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSizes();
  }, [currentPage]);

  const handleShowAdd = () => {
    setEditMode(false);
    setCurrentSize({ id: null, name: "", active: "active" });
    setShowModal(true);
  };

  const handleShowEdit = (size) => {
    setEditMode(true);
    setCurrentSize(size);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentSize({ id: null, name: "", active: "active" });
  };

  const openDeleteModal = (id) => {
    setSizeToDelete(id);
    setShowModalDelete(true);
  };

  const closeDeleteModal = () => {
    setShowModalDelete(false);
    setSizeToDelete(null);
  };

  const handleDelete = async () => {
    if (!sizeToDelete) return;
    try {
      await deleteSize(token, sizeToDelete);
      setMessage("Xóa size thành công!");
      closeDeleteModal();
      fetchSizes();
    } catch (error) {
      setMessage(error.message || "❌ Lỗi khi xóa size.");
    }
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await updateSize(token, currentSize.id, currentSize);
        setMessage("Cập nhật thành công!");
      } else {
        await createSize(token, currentSize);
        setMessage("Thêm mới thành công!");
      }
      handleCloseModal();
      fetchSizes();
    } catch (err) {
      console.error("Lỗi lưu size:", err);
      setMessage("Thao tác thất bại.");
    }
  };

  const handleExport = async () => {
    try {
      const response = await getAllSizes(token);
      const data = response.data;
      const exportData = data.map((item, index) => ({
        STT: index + 1,
        "Tên size": item.name,
        "Trạng thái": item.status === 1 ? "Hiển thị" : "Ẩn",
        "Ngày tạo": item.created_at,
        "Ngày cập nhật": item.updated_at,
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sizes");
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "sizes.xlsx");
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
    }
  };

  const renderPagination = () => {
    const items = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    return <Pagination className="justify-content-center">{items}</Pagination>;
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="container-fluid my-4" style={{ paddingLeft: "35px" }}>
      <Row className="align-items-center mb-3">
        <Col>
          <h4 className="fw-bold">📏 Quản lý Size</h4>
        </Col>
      </Row>
      <Row className="align-items-center mb-3">
        <Col className="text-start">
          <Button variant="primary" className="me-2" onClick={handleShowAdd}>
            ➕ Thêm Size
          </Button>
          <Button variant="success" onClick={handleExport}>
            📤 Xuất Excel
          </Button>
        </Col>
      </Row>
      {message && (
        <Alert variant={message.includes("Lỗi") ? "danger" : "success"}>
          {message}
        </Alert>
      )}

      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped bordered hover responsive className="shadow-sm">
          <thead className="table-light text-center">
            <tr>
              <th>#</th>
              <th>Tên Size</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody className="align-middle text-center">
            {sizes.length > 0 ? (
              sizes.map((size, index) => (
                <tr key={size.id}>
                  <td>{(currentPage - 1) * limit + index + 1}</td>
                  <td>{size.name}</td>
                  <td>
                    <Badge
                      bg={size.active === "active" ? "success" : "secondary"}
                    >
                      {size.active === "active" ? "Hiện" : "Ẩn"}
                    </Badge>
                  </td>
                  <td>
                    {new Date(size.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td>
                    <OverlayTrigger overlay={<Tooltip>Sửa size</Tooltip>}>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowEdit(size)}
                      >
                        <MdOutlineAutoFixHigh />
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger overlay={<Tooltip>Xóa size</Tooltip>}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => openDeleteModal(size.id)}
                      >
                        <MdDeleteOutline />
                      </Button>
                    </OverlayTrigger>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {renderPagination()}

      {/* Modal Thêm / Sửa */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "✏️ Sửa Size" : "➕ Thêm Size"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Tên Size</Form.Label>
            <Form.Control
              type="text"
              value={currentSize.name}
              onChange={(e) =>
                setCurrentSize({ ...currentSize, name: e.target.value })
              }
              placeholder="Nhập tên size..."
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select
              value={currentSize.active}
              onChange={(e) =>
                setCurrentSize({ ...currentSize, active: e.target.value })
              }
            >
              <option value="active">Hiện</option>
              <option value="inactive">Ẩn</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Huỷ
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editMode ? "Cập nhật" : "Thêm mới"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Xoá */}
      <Modal show={showModalDelete} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>⚠️ Xác nhận xoá</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn xoá size này không?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Xoá
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Size;
