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
import {
  filterOrders,
  deleteOrderById,
  updateOrderStatus,
} from "../api/orderApi";
import * as XLSX from "xlsx";
import { FiEye } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { showSuccessToast ,showErrorToast} from "../ultis/toastUtils";

const OrderList = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    keyword: "",
    status: "",
  });
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalOrders: 0,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await filterOrders(filters);
      console.log(data);
      
      setOrders(data.orders);
      setPagination({
        totalPages: data.totalPages,
        totalOrders: data.totalOrders,
        currentPage: data.currentPage,
      });
    } catch (err) {
      console.error("Lỗi khi tải đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const openDeleteModal = (orderId) => {
    setOrderToDelete(orderId);
    setShowModal(true);
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setOrderToDelete(null);
  };

  const handleDelete = async () => {
    try {
      await deleteOrderById(orderToDelete);
      showSuccessToast("Đơn hàng","🗑️ Đơn hàng đã được xóa.");
      fetchOrders();
    } catch {
      showErrorToast("Đơn hàng","Xóa đơn hàng thất bại.");
    } finally {
      closeDeleteModal();
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, user.id);
      showSuccessToast("Đơn hàng","Trạng thái đơn hàng đã được cập nhật.");
      fetchOrders();
    } catch (err) {
      showErrorToast("Đơn hàng","Lỗi khi cập nhật trạng thái.");
    }
  };

  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      orders.map((order) => ({
        "Mã ĐH": `DH${order.order_id.toString().padStart(4, "0")}`,
        "Khách hàng": order.customer_name,
        SĐT: order.customer_phone,
        Email: order.customer_email,
        "Địa chỉ": order.address,
        "Ngày tạo": new Date(order.created_at).toLocaleDateString(),
        "Tổng tiền": `${Number(order.final_total).toLocaleString()} VND`,
        "Trạng thái": order.status,
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws, "Đơn hàng");
    XLSX.writeFile(wb, "don_hang.xlsx");
  };

  const renderStatusBadge = (status) => {
    let variant = "secondary";
    switch (status) {
      case "Chờ xử lý":
        variant = "warning";
        break;
      case "Đang giao":
        variant = "info";
        break;
      case "Đã giao":
        variant = "success";
        break;
      case "Đã hủy":
        variant = "danger";
        break;
    }
    return <Badge bg={variant}>{status}</Badge>;
  };

  return (
    <div className="container-fluid my-4" style={{ paddingLeft: "35px" }}>
      <Row className="align-items-center mb-3">
        <Col>
          <h4>📦 Danh sách đơn hàng</h4>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="🔍 Tìm tên / email / SĐT"
            name="keyword"
            value={filters.keyword}
            onChange={handleFilterChange}
          />
        </Col>
        <Col md={3}>
          <Form.Select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">-- Tất cả trạng thái --</option>
            <option value="Chờ xử lý">Chờ xử lý</option>
            <option value="Đang giao">Đang giao</option>
            <option value="Đã giao">Đã giao</option>
            <option value="Đã hủy">Đã hủy</option>
          </Form.Select>
        </Col>
        <Col className="text-end">
          <Button variant="success" onClick={handleExportToExcel}>
            📄 Xuất Excel
          </Button>
        </Col>
      </Row>

     {loading ? (
        <div className="text-center py-5 w-100 d-flex justify-content-center align-items-center h-100">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <Table
              responsive
              bordered
              hover
              className="align-middle text-center table-striped shadow-sm"
            >
              <thead className="table-dark">
                <tr>
                  <th>Mã ĐH</th>
                  <th>Khách hàng</th>
                  <th>SĐT</th>
                  <th>Email</th>
                  <th>Địa chỉ</th>
                  <th>Ngày tạo</th>
                  <th>Tổng tiền</th>
                  <th>Hình thức</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody className="table-group-divider">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-4">
                      Không có đơn hàng nào.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.order_id}>
                      <td>DH{order.order_id.toString().padStart(4, "0")}</td>
                      <td>{order.customer_name}</td>
                      <td>{order.customer_phone}</td>
                      <td>{order.customer_email}</td>
                      <td>
                        {order.address.length > 15
                          ? order.address.slice(0, 15) + "..."
                          : order.address}
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>{Number(order.final_total).toLocaleString()} VND</td>
                      <td>{order.payment_method}</td>
                      <td>
                        <Form.Select
                          value={order.status || ""}
                          onChange={(e) =>
                            handleStatusChange(order.order_id, e.target.value)
                          }
                          disabled={
                            order.status === "Đã giao" || order.status === "Đã hủy"
                          }
                        >
                          <option value="Chờ xử lý">Chờ xử lý</option>
                          <option value="Đang giao">Đang giao</option>
                          <option value="Đã giao">Đã giao</option>
                          <option value="Đã hủy">Đã hủy</option>
                        </Form.Select>
                      </td>
                      <td className="d-flex gap-2 justify-content-center">
                        <OverlayTrigger overlay={<Tooltip>Xem chi tiết</Tooltip>}>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            as={Link}
                            to={`/don-hang/chi-tiet/${order.order_id}`}
                          >
                            <FiEye />
                          </Button>
                        </OverlayTrigger>
                        {user?.role === "admin" && (
                          <OverlayTrigger overlay={<Tooltip>Xóa đơn</Tooltip>}>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => openDeleteModal(order.order_id)}
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
          </div>

          {/* Phân trang */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 px-2">
            <div className="mb-2 mb-md-0">
              <small className="text-muted fw-medium">
                Tổng cộng <strong>{pagination.totalOrders}</strong> đơn hàng
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
                    className="fw-bold"
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
          <Modal.Title>Xác nhận xóa đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn xóa đơn hàng này không?</Modal.Body>
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

export default OrderList;
