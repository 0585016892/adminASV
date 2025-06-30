import React, { useEffect, useState } from "react";
import NumberFormat from 'react-number-format';
import {
  Table,
  Button,
  Form,
  Modal,
  Row,
  Col,
  Alert,
  Card,
  Pagination,
  Spinner,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import {
  filterCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  updateCouponStatus,
} from "../api/couponApi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [message, setMessage] = useState("");

  const [filters, setFilters] = useState({
    page: 1,
    limit: 8,
    status: "",
    keyword: "",
    discount_type: "",
    min_order_total: "",
  });

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "fixed",
    discount_value: 0,
    min_order_total: 0,
    start_date: "",
    end_date: "",
    quantity: 0,
    status: "active",
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await filterCoupon(filters);
      setCoupons(data.coupons || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Lỗi khi fetch coupon:", error);
      setCoupons([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      description: "",
      discount_type: "fixed",
      discount_value: 0,
      min_order_total: 0,
      start_date: "",
      end_date: "",
      quantity: 0,
      status: "active",
    });
    setShowModal(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon.id);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_total: coupon.min_order_total || 0,
      quantity: coupon.quantity || 0,
      start_date: coupon.start_date?.slice(0, 16) || "",
      end_date: coupon.end_date?.slice(0, 16) || "",
      status: coupon.status,
    });
    setShowModal(true);
  };

  const openDeleteModal = (id) => {
    setCouponToDelete(id);
    setShowModalDelete(true);
  };

  const closeDeleteModal = () => {
    setShowModalDelete(false);
    setCouponToDelete(null);
  };

  const handleDelete = async () => {
    if (!couponToDelete) return;
    try {
      await deleteCoupon(couponToDelete);
      setMessage("Xóa thành công!");
      closeDeleteModal();
      fetchData();
    } catch (error) {
      alert(error.message || "❌ Lỗi khi xóa mã giảm giá.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon, formData);
        setMessage("Cập nhật mã giảm giá thành công!");
      } else {
        await createCoupon(formData);
        setMessage("Thêm mã giảm giá thành công!");
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("Lỗi khi cập nhật mã giảm giá:", err);
      setMessage(`Lỗi: ${err.message || "Không thể cập nhật mã giảm giá."}`);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "active" : "inactive") : value,
    }));
  };

  const handleStatusChange = async (e, couponId) => {
    const newStatus = e.target.value;
    try {
      const response = await updateCouponStatus(couponId, newStatus);
      if (response.success || response.updatedCoupon) {
        setMessage("Cập nhật trạng thái thành công!");
        fetchData();
      }
    } catch (error) {
      setMessage("Lỗi khi cập nhật trạng thái.");
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };
  // Hàm xuất Excel
  const exportToExcel = () => {
    // Chuẩn bị dữ liệu với tên cột tiếng Việt
    const exportData = coupons.map((item) => ({
      ID: item.id, // ID (cột từ CSDL)
      "Mã giảm giá": item.code, // Mã giảm giá (cột từ CSDL)
      "Giảm giá theo": item.discount_type === "fixed" ? "Đồng" : "%", // Mã giảm giá (cột từ CSDL)
      "Giảm giá":
        item.discount_type === "fixed"
          ? Number(item.discount_value).toLocaleString("vi-VN") + "đ" // Hiển thị giá trị cố định mà không có %
          : item.discount_value + "%", // Kiểm tra loại giảm giá // Phần trăm giảm (cột từ CSDL)
      "Đơn tối thiểu": Number(item.min_order_total).toLocaleString("vi-VN"),
      "Ngày bắt đầu": item.start_date,
      "Ngày hết hạn": item.end_date, // Ngày hết hạn (cột từ CSDL)
      "Số lượng mã": item.quantity, // Ngày hết hạn (cột từ CSDL)
      "Trạng thái": item.status ? "Hiệu lực" : "Hết hạn", // Trạng thái (cột từ CSDL)
    }));

    // Chuyển dữ liệu sang định dạng sheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Tạo workbook và thêm worksheet vào
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh_sach_coupon");

    // Viết workbook thành buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Tạo Blob và lưu file
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "Danh_sach_coupon.xlsx");
  };
  return (
    <div className="container-fluid my-4" style={{ paddingLeft: "35px" }}>
      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Row className="mb-3">
            <Col>
              <h4>Quản lý khuyến mãi</h4>
            </Col>
            <Col className="text-end">
              <Button onClick={openAddModal}>
                <FaPlus className="me-2" /> Thêm mã mới
              </Button>
            </Col>
            <Col>
              <Button
                variant="success"
                onClick={exportToExcel}
                className="me-2"
              >
                Xuất Excel
              </Button>
            </Col>
          </Row>

          {message && (
            <Alert variant={message.includes("Lỗi") ? "danger" : "success"}>
              {message}
            </Alert>
          )}

          <Form className="mb-4">
            <Row>
              <Col sm={3}>
                <Form.Control
                  type="text"
                  name="keyword"
                  value={filters.keyword}
                  onChange={handleFilterChange}
                  placeholder="Tìm kiếm theo mã"
                />
              </Col>
              <Col sm={3}>
                <Form.Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">Trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </Form.Select>
              </Col>
              <Col sm={3}>
                <Form.Select
                  name="discount_type"
                  value={filters.discount_type}
                  onChange={handleFilterChange}
                >
                  <option value="">Loại giảm</option>
                  <option value="fixed">Cố định</option>
                  <option value="percent">Phần trăm</option>
                </Form.Select>
              </Col>
              <Col sm={3}>
                <Form.Control
                  type="number"
                  name="min_order_total"
                  value={filters.min_order_total}
                  onChange={handleFilterChange}
                  placeholder="Đơn tối thiểu"
                />
              </Col>
            </Row>
          </Form>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Mô tả</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Đơn tối thiểu</th>
                <th>Lượt dùng</th>
                <th>Hiệu lực</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center">
                   <div className="text-center py-5 w-100  d-flex justify-content-center align-items-center h-100">
                      <Spinner animation="border" variant="primary" />
                  </div>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">
                    Không có mã nào.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id}>
                    <td>C{c.id}</td>
                    <td>{c.code}</td>
                    <td>
                      {c.description == 1
                        ? "Mã giảm giá cho sản phẩm"
                        : "Mã giảm giá cho tổng hóa đơn"}
                    </td>
                    <td>{c.discount_type === "percent" ? "%" : "₫"}</td>
                    <td>{parseFloat(c.discount_value)}</td>
                    <td>
                      {Number(c.min_order_total).toLocaleString("vi-VN")}₫
                    </td>
                    <td>{c.quantity}</td>
                    <td>
                      {new Date(c.start_date).toLocaleDateString()} –{" "}
                      {new Date(c.end_date).toLocaleDateString()}
                    </td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={c.status}
                        onChange={(e) => handleStatusChange(e, c.id)}
                      >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                      </Form.Select>
                    </td>
                    <td className="text-center">
                      <OverlayTrigger overlay={<Tooltip>Sửa</Tooltip>}>
                        <Button
                          className="me-2"
                          size="sm"
                          variant="outline-primary"
                          onClick={() => openEditModal(c)}
                        >
                          <FaEdit />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger overlay={<Tooltip>Xóa</Tooltip>}>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => openDeleteModal(c.id)}
                        >
                          <FaTrash />
                        </Button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <Pagination>
            {[...Array(totalPages).keys()].map((p) => (
              <Pagination.Item
                key={p + 1}
                active={filters.page === p + 1}
                onClick={() => setFilters({ ...filters, page: p + 1 })}
              >
                {p + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCoupon ? "Cập nhật mã giảm giá" : "Thêm mã giảm giá"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Mã</Form.Label>
              <Form.Control
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Chi tiết</Form.Label>
              <Form.Select
                name="description"
                value={formData.description}
                onChange={handleChange}
              >
                <option value="1">Giảm cho sản phẩm</option>
                <option value="0">Giảm cho hóa đơn</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Loại</Form.Label>
              <Form.Select
                name="discount_type"
                value={formData.discount_type}
                onChange={handleChange}
              >
                <option value="fixed">Giảm cố định</option>
                <option value="percent">Giảm phần trăm</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Giá trị</Form.Label>
              <Form.Control
                type="number"
                name="discount_value"
                value={formData.discount_value}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Đơn hàng tối thiểu</Form.Label>
              <Form.Control
                type="number"
                name="min_order_total"
                value={formData.min_order_total}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Bắt đầu</Form.Label>
              <Form.Control
                type="datetime-local"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Kết thúc</Form.Label>
              <Form.Control
                type="datetime-local"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số lượng</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Hoạt động"
                name="status"
                checked={formData.status === "active"}
                onChange={handleChange}
              />
            </Form.Group>
            <Button type="submit">{editingCoupon ? "Cập nhật" : "Thêm"}</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showModalDelete} onHide={closeDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Xóa mã giảm giá</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn xóa mã này?</Modal.Body>
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

export default CouponManagement;
