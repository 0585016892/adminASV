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
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  MdDelete,
  MdOutlineAutoFixHigh,
  MdArrowDropDown,
} from "react-icons/md";
import * as XLSX from "xlsx";
import {
  getFooters,
  deleteFooterById,
  updateFooterStatus,
  addFooterChild,
} from "../api/footerApi"; // API giả định

import { IoMdArrowDropup } from "react-icons/io";
const FooterList = () => {
  const [footers, setFooters] = useState([]);
  const [filters, setFilters] = useState({ page: 1, limit: 20, keyword: "" });
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalFooters: 0,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(false);
  const [footerToDelete, setFooterToDelete] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [expandedGroups, setExpandedGroups] = useState([]);
  //lọc và get
  useEffect(() => {
    fetchFooters();
  }, [filters]);

  const fetchFooters = async () => {
    setLoading(true);
    try {
      const data = await getFooters(filters);
      setFooters(data.footers);
      setPagination({
        totalPages: data.totalPages,
        totalFooters: data.totalFooters,
        currentPage: data.currentPage,
      });
    } catch (err) {
      console.error("Lỗi khi tải footer:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };
  //xóa
  const openDeleteModal = (id) => {
    setFooterToDelete(id);
    setShowModal(true);
  };

  const closeDeleteModal = () => {
    setFooterToDelete(null);
    setShowModal(false);
  };

  const handleDelete = async () => {
    try {
      await deleteFooterById(footerToDelete);
      setMessage("🗑️ Footer đã được xóa.");
      fetchFooters();
    } catch {
      alert("❌ Xóa footer thất bại.");
    } finally {
      closeDeleteModal();
      setTimeout(() => setMessage(""), 3000);
    }
  };
  //excel
  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      footers.map((f) => ({
        STT: f.id,
        Tiêu_đề: f.title,
        "Liên kết": f.label,
        Loại: f.type,
        "Trạng thái": f.status === "active" ? "Hoạt động" : "Không hoạt động",
        "Ngày tạo": new Date(f.created_at).toLocaleDateString("vi-VN"),
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws, "Footers");
    XLSX.writeFile(wb, "footers.xlsx");
  };
  //status
  const handleStatusChange = async (e, footerId) => {
    const newStatus = e.target.value;
    try {
      const response = await updateFooterStatus(footerId, newStatus);
      if (response.success) {
        setMessage("✅ Cập nhật trạng thái thành công!");
        fetchFooters();
      }
    } catch {
      setMessage("❌ Lỗi khi cập nhật trạng thái.");
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Hàm toggle hiển thị con
  const toggleGroup = (groupId) => {
    console.log(expandedGroups); // Kiểm tra các nhóm đã mở rộng
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };
  // thêm con
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [newChildData, setNewChildData] = useState({
    title: "",
    label: "",
    value: "",
    type: "",
    parent_id: null,
    status: "",
  });

  const handleAddChild = (groupId) => {
    setNewChildData({ ...newChildData, parent_id: groupId });
    setShowAddChildModal(true); // Hiển thị modal để thêm danh mục con
  };

  const handleAddChildSubmit = async () => {
    try {
      console.log(newChildData);

      // Gửi yêu cầu thêm danh mục con lên backend
      await addFooterChild(newChildData); // API thêm footer con

      fetchFooters(); // Cập nhật lại danh sách
      setShowAddChildModal(false);
      setMessage("✅ Đã thêm danh mục con!");
    } catch {
      setMessage("❌ Lỗi khi thêm danh mục con.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewChildData((prev) => ({ ...prev, [name]: value }));
  };

  const getChildFooters = (groupId) => {
    // Tìm footer có ID trùng khớp trong children
    const parentFooter = footers.find((f) => String(f.id) === String(groupId));
    if (parentFooter && parentFooter.children) {
      return parentFooter.children;
    } else {
      return []; // Nếu không tìm thấy hoặc không có children
    }
  };
  const renderFooterRow = (f, isChild = false) => (
    <tr key={f.id} className={isChild ? "table-secondary" : ""}>
      <td>{isChild ? `↳ FO0${f.id}` : `FOO0${f.id}`}</td>
      <td
        className={`${isChild ? "text-start ps-4" : ""} text-truncate`}
        style={{ maxWidth: "200px" }}
      >
        {f.title}
      </td>
      <td>
        {f.value === "phone" && f.label ? (
          <a
            href={`tel:${f.label.replace(/\s+/g, "")}`}
            className="text-decoration-none"
          >
            {f.label}
          </a>
        ) : f.value === "email" && f.label ? (
          <a href={`mailto:${f.label}`} className="text-decoration-none">
            {f.label}
          </a>
        ) : f.value === "address" && f.label ? (
          <a
            href="https://daotaodaihoc.humg.edu.vn/#/home"
            className="text-decoration-none"
          >
            {f.label}
          </a>
        ) : f.value === "link" && f.label ? (
          <a href={f.label} target="_blank" rel="noopener noreferrer">
            {f.label}
          </a>
        ) : (
          "—"
        )}
      </td>
      <td>
        <Form.Select
          size="sm"
          value={f.status}
          onChange={(e) => handleStatusChange(e, f.id)}
        >
          <option value="active">Hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </Form.Select>
      </td>
      <td>{new Date(f.created_at).toLocaleDateString("vi-VN")}</td>
      <td className="d-flex gap-2 justify-content-center">
        {!isChild && f.type === "group" && (
          <>
            <Button
              variant="link"
              size="sm"
              onClick={() => toggleGroup(f.id)}
              className="p-0 "
            >
              {expandedGroups.includes(f.id) ? (
                <OverlayTrigger overlay={<Tooltip>Danh sách</Tooltip>}>
                  <Button variant="outline-secondary" size="sm">
                    <MdArrowDropDown size={20} />
                  </Button>
                </OverlayTrigger>
              ) : (
                <OverlayTrigger overlay={<Tooltip>Danh sách</Tooltip>}>
                  <Button variant="outline-secondary" size="sm">
                    <IoMdArrowDropup size={20} />
                  </Button>
                </OverlayTrigger>
              )}
            </Button>
            <OverlayTrigger overlay={<Tooltip>Thêm danh sách con</Tooltip>}>
              <Button
                variant="outline-info"
                size="sm"
                onClick={() => handleAddChild(f.id)} // Nút thêm danh mục con
              >
                ➕
              </Button>
            </OverlayTrigger>
          </>
        )}
        <OverlayTrigger overlay={<Tooltip>Sửa</Tooltip>}>
          <Button
            as={Link}
            to={`/footers/edit/${f.id}`}
            variant="outline-info"
            size="sm"
          >
            <MdOutlineAutoFixHigh />
          </Button>
        </OverlayTrigger>
        <OverlayTrigger overlay={<Tooltip>Xóa</Tooltip>}>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => openDeleteModal(f.id)}
          >
            <MdDelete />
          </Button>
        </OverlayTrigger>
      </td>
    </tr>
  );

  return (
    <div className="container-fluid mt-md-4  " style={{ paddingLeft: "35px" }}>
      <Row className="align-items-center mb-3">
        <Col>
          <h4>📜 Danh sách footer</h4>
          {message && <div className="alert alert-success mt-2">{message}</div>}
        </Col>
        <Col className="text-end">
          <Button as={Link} to="/footers/create" variant="primary">
            ➕ Thêm footer
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={5}>
          <Form.Control
            type="text"
            placeholder="🔍 Tìm tiêu đề"
            name="keyword"
            value={filters.keyword}
            onChange={handleFilterChange}
          />
        </Col>
        <Col className="text-end">
          <Button variant="success" onClick={handleExportToExcel}>
            📄 Xuất Excel
          </Button>
        </Col>
      </Row>

      <div className="d-flex justify-content-between align-items-center mb-3 px-2">
        <small className="text-muted fw-medium">
          Tổng cộng <strong>{pagination.totalFooters}</strong> footer
        </small>
        <Pagination className="m-0">
          <Pagination.First
            onClick={() => handlePageChange(1)}
            disabled={pagination.currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          />
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === pagination.currentPage}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
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

      <div className="table-responsive">
        <Table bordered hover className="text-center table-striped shadow-sm">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Liên kết</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">
                  <div className="text-center py-5  d-flex justify-content-center align-items-center h-100">
                           <Spinner animation="border" variant="primary" />
                         </div>
                </td>
              </tr>
            ) : footers?.length === 0 ? (
              <tr>
                <td colSpan="6">Không có footer nào.</td>
              </tr>
            ) : (
              footers
                .filter((f) => !f.parent_id)
                .map((f) => (
                  <React.Fragment key={f.id}>
                    {renderFooterRow(f)}
                    {expandedGroups.includes(f.id) && (
                      <tr>
                        <td colSpan="6" className="p-0 bg-light">
                          <div className="p-2">
                            <Table bordered size="sm" className="mb-0">
                              <thead className="table-light">
                                <tr>
                                  <th>ID</th>
                                  <th>Tiêu đề</th>
                                  <th>Liên kết</th>
                                  <th>Trạng thái</th>
                                  <th>Ngày tạo</th>
                                  <th>Hành động</th>
                                </tr>
                              </thead>
                              <tbody>
                                {getChildFooters(f.id).map((child) =>
                                  renderFooterRow(child, true)
                                )}
                              </tbody>
                            </Table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
            )}
          </tbody>
        </Table>
      </div>
      <Modal
        show={showAddChildModal}
        onHide={() => setShowAddChildModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm danh mục con</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={newChildData.title}
                onChange={handleInputChange}
                placeholder="Nhập tiêu đề"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Liên kết</Form.Label>
              <Form.Control
                type="text"
                name="label"
                value={newChildData.label}
                onChange={handleInputChange}
                placeholder="Nhập liên kết"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Giá trị (link hoặc nội dung)</Form.Label>
              <Form.Control
                type="text"
                name="value"
                value={newChildData.value}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Loại</Form.Label>
              <Form.Select
                name="type"
                value={newChildData.type}
                onChange={handleInputChange}
              >
                <option value="">---Loại---</option>
                <option value="link">Link</option>
                <option value="text">Text</option>
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select
                name="status"
                value={newChildData.status}
                onChange={handleInputChange}
              >
                <option value="">---Chọn trạng thái---</option>
                <option value="active">Hiển thị</option>
                <option value="inactive">Ẩn</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddChildModal(false)}
          >
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddChildSubmit}>
            Thêm
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showModal} onHide={closeDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa footer</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn xóa footer này không?</Modal.Body>
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

export default FooterList;
