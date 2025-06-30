import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Form,
  Row,
  Col,
  Pagination,
  Modal,
  Card,
} from "react-bootstrap";
import { getAllDanhMuc, filterDanhmuc, deleteDanhMuc } from "../api/danhmucApi";
import { Link } from "react-router-dom";
import { MdDelete, MdOutlineAutoFixHigh } from "react-icons/md";
import { useAuth } from "../contexts/AuthContext";
const DsDanhMuc = () => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [danhmuc, setDanhmuc] = useState([]);
  const [danhmucToDelete, setDanhMucToDelete] = useState(null);
  const [totalDanhMuc, setTotalDanhMuc] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 8,
    keyword: "",
    status: "",
    seoScore: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await filterDanhmuc(filters); // Gọi API lọc

      setDanhmuc(data.categories);
      setTotalDanhMuc(data.totalCategories);
      setTotalPages(data.totalPages);
      setLoading(false);
    };
    fetchData();
  }, [filters]);

  const handlePageChange = (pageNumber) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      page: pageNumber,
    }));
  };

  const handleDelete = async () => {
    if (!danhmucToDelete) return;

    try {
      const result = await deleteDanhMuc(danhmucToDelete);
      setDanhmuc((prevDanhmuc) =>
        prevDanhmuc.filter((prod) => prod.id !== danhmucToDelete)
      );
      setMessage(result.message);
      setShowModal(false);
    } catch (error) {
      alert(error.message || "❌ Lỗi khi xóa sản phẩm.");
    }
  };

  const openDeleteModal = (id) => {
    setDanhMucToDelete(id);
    setShowModal(true);
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setDanhMucToDelete(null);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="container-fluid my-4" style={{ paddingLeft: "35px" }}>
      <Row className="align-items-center mb-3">
        <Col>
          <h4 className="fw-bold text-primary">Danh Mục</h4>
          {message && <div className="alert alert-info">{message}</div>}
        </Col>
        {user?.role === "admin" && (
          <Col className="text-end">
            <Button variant="warning" className="shadow-sm">
              <Link
                to={"/danh-muc/them"}
                style={{ textDecoration: "none", color: "black" }}
              >
                Thêm danh mục
              </Link>
            </Button>
          </Col>
        )}
      </Row>

      {/* Filter Form */}
      <div>
        <Row className="mb-3">
          <Col md={3}>
            <Form.Control
              type="text"
              placeholder="Từ khóa"
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              className="shadow-sm"
            />
          </Col>
          <Col md={3}>
            <Form.Select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="shadow-sm"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Kích hoạt</option>
              <option value="inactive">Không kích hoạt</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Button
              variant="secondary"
              onClick={() => setFilters(filters)}
              className="shadow-sm"
            >
              Áp dụng
            </Button>
          </Col>
        </Row>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center">
        <div>{totalDanhMuc} danh mục</div>
        <Pagination>
          <Pagination.First onClick={() => handlePageChange(1)} />
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {[...Array(totalPages).keys()]?.map((page) => (
            <Pagination.Item
              key={page + 1}
              active={currentPage === page + 1}
              onClick={() => handlePageChange(page + 1)}
            >
              {page + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last onClick={() => handlePageChange(totalPages)} />
        </Pagination>
      </div>

      {/* Danh sách danh mục */}
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {loading ? (
          <div className="col-12 text-center">Đang tải dữ liệu...</div>
        ) : (
          danhmuc?.map((prod) => (
            <div className="col" key={prod.id}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>{prod.name}</Card.Title>
                  <Card.Text>{prod.description}</Card.Text>
                  <div>
                    <strong>Trạng thái:</strong>{" "}
                    <span
                      style={{
                        color: prod.status === "active" ? "green" : "red",
                      }}
                    >
                      {prod.status === "active"
                        ? "Kích hoạt"
                        : "Không kích hoạt"}
                    </span>
                  </div>
                  {user?.role === "admin" && (
                    <div className="mt-3">
                      <Button
                        variant="outline-primary"
                        as={Link}
                        to={`/danh-muc/sua/${prod.id}`}
                        className="me-2"
                      >
                        <MdOutlineAutoFixHigh /> Chỉnh sửa
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => openDeleteModal(prod.id)}
                      >
                        <MdDelete /> Xóa
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          ))
        )}
      </div>

      {/* Modal xác nhận xóa */}
      <Modal show={showModal} onHide={closeDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa danh mục</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn xóa danh mục này không?</Modal.Body>
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

export default DsDanhMuc;
