import React, { useEffect, useState } from "react";
import { Table, Spinner, Alert } from "react-bootstrap";
import {
  getCustomers,
  filterKhachhang,
  deleteKhachhang,
  updateCustomerStatus,
} from "../api/customerApi";
import {
  Button,
  Form,
  Row,
  Col,
  Pagination,
  Modal,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { MdDelete, MdOutlineAutoFixHigh } from "react-icons/md";
import { FaRegEye } from "react-icons/fa6";
import { useAuth } from "../contexts/AuthContext";
import { showSuccessToast ,showErrorToast} from "../ultis/toastUtils";

const DanhSachKhachhang = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [khachhangToDelete, setKhachhangToDelete] = useState(null);
  const [totalKhachhang, setTotalKhachhang] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState("");

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    keyword: "",
    status: "",
    seoScore: "",
  });
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await filterKhachhang(filters); // Gọi API lọc
      
      setCustomers(data.customers);
      setTotalKhachhang(data.totalCustomers);
      setTotalPages(data.totalPages);
      setLoading(false);
    };
    fetchData();
  }, [filters]); // Fetch lại khi filters thay đổi

  const handlePageChange = (pageNumber) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      page: pageNumber,
    }));
  };
  const handleDelete = async () => {
    if (!khachhangToDelete) return;

    try {
      const result = await deleteKhachhang(khachhangToDelete);
      setCustomers((prevDanhmuc) =>
        prevDanhmuc.filter((cus) => cus.id !== khachhangToDelete)
      );
      showSuccessToast("Khách hàng",result.message);
      setShowModal(false);
    } catch (error) {
      showErrorToast("Khách hàng",error.message || "❌ Lỗi khi xóa sản phẩm.");
    }
  };
  const openDeleteModal = (id) => {
    setKhachhangToDelete(id);
    setShowModal(true);
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setKhachhangToDelete(null);
  };
  // Cập nhật filter khi thay đổi
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Gọi API để cập nhật trạng thái khách hàng
      await updateCustomerStatus(id, newStatus);

      // Cập nhật trạng thái của khách hàng trong state
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer.id === id ? { ...customer, status: newStatus } : customer
        )
      );

      showSuccessToast("Khách hàng","Cập nhật trạng thái thành công!");
    } catch (error) {
      showErrorToast("Khách hàng","Có lỗi khi cập nhật trạng thái.");
    }
  };
  return (
    <div className="container-fluid my-4" style={{ paddingLeft: "35px" }}>
      <Row className="align-items-center mb-3">
        <Col md={6}>
          <h4 className="mb-3 fw-bold">Danh sách khách hàng</h4>
        </Col>
      </Row>
      {/* Filter Form */}
      <div>
        <Row className="mb-4">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Tìm kiếm</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên khách hàng"
                name="keyword"
                value={filters.keyword}
                onChange={handleFilterChange}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </div>
      
      {loading ? (
          <div className="text-center py-5 w-100 d-flex justify-content-center align-items-center h-100">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            <Table striped bordered hover responsive className="shadow-sm">
              <thead className="table-dark">
                <tr>
                  <th>Mã khách hàng</th>
                  <th>Tên khách hàng</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Địa chỉ</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center">
                      Không có khách hàng nào.
                    </td>
                  </tr>
                ) : (
                  customers.map((cus) => (
                    <tr key={cus.id}>
                      <td>KH0000{cus.id}</td>
                      <td>{cus.full_name}</td>
                      <td>{cus.email}</td>
                      <td>{cus.phone}</td>
                      <td>
                        {cus.address.length > 30
                          ? cus.address.slice(0, 30) + "..."
                          : cus.address}
                      </td>
                      <td>
                        {user?.role === "admin" ? (
                          <Form.Control
                            as="select"
                            value={cus.status}
                            onChange={(e) =>
                              handleStatusChange(cus.id, e.target.value)
                            }
                            style={{ maxWidth: "150px" }}
                          >
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Không hoạt động</option>
                          </Form.Control>
                        ) : (
                          "Không được xem"
                        )}
                      </td>
                      <td className="text-center">
                        <OverlayTrigger overlay={<Tooltip>Xem chi tiết</Tooltip>}>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            as={Link}
                            to={`/customers/details/${cus.id}`}
                          >
                            <FaRegEye />
                          </Button>
                        </OverlayTrigger>
                        {user?.role === "admin" && (
                          <OverlayTrigger overlay={<Tooltip>Xóa</Tooltip>}>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => openDeleteModal(cus.id)}
                            >
                              <MdDelete />
                            </Button>
                          </OverlayTrigger>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>

            {/* Phân trang */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <span className="text-muted">
                Có <strong>{totalKhachhang}</strong> khách hàng
              </span>
              <Pagination className="mb-0">
                <Pagination.First onClick={() => handlePageChange(1)} />
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages).keys()].map((page) => (
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
          </>
        )}

      {/* Modal xác nhận xóa */}
      <Modal show={showModal} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa khách hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn xóa khách hàng này không?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Xác nhận xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DanhSachKhachhang;
