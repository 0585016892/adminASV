import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Alert,
  OverlayTrigger,
  Tooltip,
  Spinner,
  Pagination,
} from "react-bootstrap";
import { MdDeleteOutline, MdOutlineAutoFixHigh } from "react-icons/md";
import { FaPlus, FaFileExport } from "react-icons/fa";
import {
  getColors,
  createColor,
  updateColor,
  deleteColor,
  getAllColors,
} from "../api/colorApi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { showSuccessToast ,showErrorToast} from "../ultis/toastUtils";

const Color = () => {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // Đã khai báo page
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentColor, setCurrentColor] = useState({
    id: null,
    name: "",
    code: "#000000",
    status: "active",
  });
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [colorToDelete, setColorToDelete] = useState(null);
  const [message, setMessage] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const token = localStorage.getItem("token");
  const limit = 15;

  // Lấy dữ liệu khi page thay đổi
  const fetchColors = async () => {
    try {
      setLoading(true);
      const data = await getColors(token, page, limit);
      setColors(data.data.data);
      setTotalPages(data.data.totalPages || 1); // lấy số trang từ API
    } catch (error) {
      showErrorToast("Màu","❌ Lỗi khi tải dữ liệu màu!");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchColors();
  }, [page]);

  const handleShowAdd = () => {
    setEditMode(false);
    setCurrentColor({ id: null, name: "", code: "#000000", status: "active" });
    setShowModal(true);
  };

  const handleShowEdit = (color) => {
    setEditMode(true);
    setCurrentColor(color);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await updateColor(token, currentColor.id, currentColor);
        showSuccessToast("Màu !","Cập nhật màu thành công!");
      } else {
        await createColor(token, currentColor);
        showSuccessToast("Màu !","Thêm màu thành công!");
      }
      setShowModal(false);
      fetchColors();
    } catch (error) {
      showErrorToast("Màu !","❌ Lỗi khi xử lý màu!");
    }
  };

  const openDeleteModal = (id) => {
    setColorToDelete(id);
    setShowModalDelete(true);
  };

  const handleDelete = async () => {
    try {
      await deleteColor(token, colorToDelete);
      showSuccessToast("Màu !","Xoá màu thành công!");
      fetchColors();
    } catch (error) {
      showErrorToast("Màu !","Lỗi khi xoá màu!");
    } finally {
      setShowModalDelete(false);
    }
  };
  const handleExport = async () => {
    try {
      const response = await getAllColors(token);
      const data = response.data;
      const exportData = data.map((item, index) => ({
        STT: index + 1,
        "Tên size": item.name,
        "Trạng thái": item.status === "active" ? "Hiển thị" : "Ẩn",
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
      saveAs(blob, "bảng màu.xlsx");
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
    }
  };
  const renderPagination = () => {
    const items = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <Pagination.Item key={i} active={i === page} onClick={() => setPage(i)}>
          {i}
        </Pagination.Item>
      );
    }
    return <Pagination className="justify-content-center">{items}</Pagination>;
  };

  return (
    <div className="container-fluid my-4" style={{ paddingLeft: "35px" }}>
      <Row className="mb-3">
        <Col md={12}>
          <h4>🎨 Quản lý Màu</h4>
        </Col>
        <Col className="text-end">
          <Button variant="primary" className="me-2" onClick={handleShowAdd}>
            <FaPlus className="me-1" /> Thêm màu
          </Button>
          <Button variant="success" onClick={handleExport}>
            <FaFileExport className="me-1" />
            Xuất Excel
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5  d-flex justify-content-center align-items-center h-100">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Tên màu</th>
              <th>Mã màu</th>
              <th>Màu hiển thị</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {colors.length > 0 ? (
              colors.map((color, index) => (
                <tr key={color.id}>
                  <td>{index + 1 + (page - 1) * limit}</td>
                  <td>{color.name}</td>
                  <td>{color.code}</td>
                  <td>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        backgroundColor: color.code,
                        border: "1px solid #ccc",
                        borderRadius: 4,
                      }}
                    ></div>
                  </td>
                  <td>{color.status === "active" ? "Hiển thị" : "Ẩn"}</td>
                  <td>{color.created_at?.slice(0, 10)}</td>
                  <td>
                    <OverlayTrigger overlay={<Tooltip>Sửa</Tooltip>}>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowEdit(color)}
                      >
                        <MdOutlineAutoFixHigh />
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger overlay={<Tooltip>Xoá</Tooltip>}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => openDeleteModal(color.id)}
                      >
                        <MdDeleteOutline />
                      </Button>
                    </OverlayTrigger>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
      {renderPagination()}

      {/* Modal thêm/sửa */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Sửa màu" : "Thêm màu"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Tên màu</Form.Label>
            <Form.Control
              type="text"
              value={currentColor.name}
              onChange={(e) =>
                setCurrentColor({ ...currentColor, name: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mã màu</Form.Label>
            <Form.Control
              type="color"
              value={currentColor.code}
              onChange={(e) =>
                setCurrentColor({ ...currentColor, code: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select
              value={currentColor.active}
              onChange={(e) =>
                setCurrentColor({ ...currentColor, active: e.target.value })
              }
            >
              <option value="active">Hiển thị</option>
              <option value="inactive">Ẩn</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editMode ? "Cập nhật" : "Thêm"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal xoá */}
      <Modal show={showModalDelete} onHide={() => setShowModalDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xoá màu</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn xoá màu này?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalDelete(false)}>
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

export default Color;
