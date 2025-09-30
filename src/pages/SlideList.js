import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Form,
  Row,
  Col,
  Pagination,
  Modal,
  Spinner,
  OverlayTrigger,
  Tooltip,
  Badge,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { MdDelete, MdOutlineAutoFixHigh } from "react-icons/md";
import * as XLSX from "xlsx";
import { FiEye } from "react-icons/fi";
import { getSlides, deleteSlideById, updateSlideStatus } from "../api/slideApi"; // giả định API
import { showSuccessToast ,showErrorToast} from "../ultis/toastUtils";
import { FaPlus, FaFileExport } from "react-icons/fa";

const URL_WEB = process.env.REACT_APP_WEB_URL; // Cập nhật URL nếu khác

const SlideList = () => {
  const [slides, setSlides] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 8,
    keyword: "",
  });
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalSlides: 0,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const data = await getSlides(filters);
      setSlides(data.slides);
      setPagination({
        totalPages: data.totalPages,
        totalSlides: data.totalSlides,
        currentPage: data.currentPage,
      });
    } catch (err) {
      console.error("Lỗi khi tải slide:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, [filters]);

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const openDeleteModal = (id) => {
    setSlideToDelete(id);
    setShowModal(true);
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setSlideToDelete(null);
  };

  const handleDelete = async () => {
    try {
      await deleteSlideById(slideToDelete);
      showSuccessToast("Slide","🗑️ Xóa  Slide thành công!.");
      fetchSlides();
    } catch {
      showErrorToast("Slide","Xóa slide thất bại.");
    } finally {
      closeDeleteModal();

    }
  };

  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      slides.map((s) => ({
        ID: s.id,
        Tiêu_đề: s.title,
        "Hình ảnh": `${URL_WEB}/uploads/${s.image}`,
        "Đường dẫn": s.link,
        "Khu vực hiển thị": s.display_area,
        "Trạng thái": s.status ? "Hiện" : "Ẩn",
        "Ngày bắt đầu": new Date(s.start_date).toLocaleDateString("vi-VN"),
        "Ngày kết thúc": new Date(s.end_date).toLocaleDateString("vi-VN"),
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws, "Slides");
    XLSX.writeFile(wb, "slides.xlsx");
  };
  const handleStatusChange = async (e, slideId) => {
    const newStatus = e.target.value;
    try {
      const response = await updateSlideStatus(slideId, newStatus);
      if (response.success) {
        showSuccessToast("Slide","Cập nhật trạng thái thành công!");
        fetchSlides();
      }
    } catch (error) {
      showErrorToast("Slide","Lỗi khi cập nhật trạng thái.");
    } finally {
      // setTimeout(() => {
      //   setMessage("");
      // }, 3000);
    }
  };
  return (
    <div className="container-fluid mt-md-4" style={{ paddingLeft: "35px" }}>
      <Row className="align-items-center mb-3">
        <Col>
          <h4>🖼️ Danh sách slide</h4>
          {/* {message && <div className="alert alert-success mt-2">{message}</div>} */}
        </Col>
       
      </Row>

      <Row className="mb-3">
      
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="🔍 Tìm tiêu đề"
            name="keyword"
            value={filters.keyword}
            onChange={handleFilterChange}
          />
        </Col>
        <Col md={6} className="text-end">
          <Button as={Link} to="/slides/create" variant="primary" className="me-2">
            <FaPlus className="me-1" /> Thêm slide
          </Button>
          <Button variant="success" onClick={handleExportToExcel}>
            <FaFileExport className="me-1" /> Xuất Excel
          </Button>
        </Col>
      </Row>

    

      {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <Table bordered hover className="text-center table-striped shadow-sm">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Tiêu đề</th>
                    <th>Hình ảnh</th>
                    <th>Đường dẫn</th>
                    <th>Khu vực hiển thị</th>
                    <th>Trạng thái</th>
                    <th>Ngày bắt đầu</th>
                    <th>Ngày kết thúc</th>
                    <th>Hành động</th>
                  </tr>
                </thead>

                <tbody>
                  {slides?.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center">
                        Không có slide nào.
                      </td>
                    </tr>
                  ) : (
                    slides?.map((s) => (
                      <tr key={s.id}>
                        <td>SL010{s.id}</td>
                        <td>{s.title}</td>
                        <td>
                          <img
                            src={`${URL_WEB}/uploads/${s.image}`}
                            alt={s.title}
                            height={50}
                          />
                        </td>
                        <td>
                          <a href={s.link} target="_blank" rel="noopener noreferrer">
                            {s.link}
                          </a>
                        </td>
                        <td>
                          <Badge bg="info">{s.display_area}</Badge>
                        </td>
                        <td>
                          <Form.Select
                            size="sm"
                            value={s.status}
                            onChange={(e) => handleStatusChange(e, s.id)}
                          >
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Không hoạt động</option>
                          </Form.Select>
                        </td>
                        <td>{new Date(s.start_date).toLocaleDateString("vi-VN")}</td>
                        <td>{new Date(s.end_date).toLocaleDateString("vi-VN")}</td>
                        <td className="d-flex gap-2 justify-content-center">
                          <OverlayTrigger overlay={<Tooltip>Sửa</Tooltip>}>
                            <Button
                              as={Link}
                              to={`/slides/edit/${s.id}`}
                              variant="outline-primary"
                              size="sm"
                            >
                              <MdOutlineAutoFixHigh />
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger overlay={<Tooltip>Xóa</Tooltip>}>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => openDeleteModal(s.id)}
                            >
                              <MdDelete />
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3 px-2">
              <div>
                <small className="text-muted fw-medium">
                  Tổng cộng <strong>{pagination.totalSlides}</strong> slide
                </small>
              </div>

              <Pagination className="m-0">
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                />
                {Array.from({ length: pagination.totalPages }, (_, idx) => {
                  const page = idx + 1;
                  return (
                    <Pagination.Item
                      key={page}
                      active={page === pagination.currentPage}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Pagination.Item>
                  );
                })}
                <Pagination.Next
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                />
                <Pagination.Last
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.currentPage === pagination.totalPages}
                />
              </Pagination>
            </div>
          </>
        )}

      <Modal show={showModal} onHide={closeDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa slide</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn xóa slide này không?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SlideList;
