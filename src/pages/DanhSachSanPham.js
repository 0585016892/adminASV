import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Form,
  Row,
  Tooltip,
  OverlayTrigger,
  Col,
  Pagination,
  Modal,
} from "react-bootstrap";
import { FaPlus, FaFileExport } from "react-icons/fa";
import {
  getAllProducts,
  deleteProduct,
  filterProducts,
  exportProductsExcel 
} from "../api/productAPI";
import { Link } from "react-router-dom";
import { MdDelete, MdOutlineAutoFixHigh } from "react-icons/md";
import { FaBoxOpen } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { FaRegEye } from "react-icons/fa6";
import { showSuccessToast ,showErrorToast} from "../ultis/toastUtils";

const URL_WEB = process.env.REACT_APP_WEB_URL; // Cập nhật URL nếu khác

const DanhSachSanPham = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 6;
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 7,
    keyword: "",
    categoryId: "",
    dateRange: "",
    productType: "",
    status: "",
    seoScore: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await filterProducts(filters);
        setProducts(data.products);
        setTotalProducts(data.totalProducts);
        setTotalPages(data.totalPages);
      } catch (error) {
        showErrorToast("Sản phẩm", error);
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
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
    if (!productToDelete) return;
    try {
      const result = await deleteProduct(productToDelete);
      setProducts((prevProducts) =>
        prevProducts.filter((prod) => prod.id !== productToDelete)
      );
      showSuccessToast("Sản phẩm",result.message);
      setShowModal(false);
    } catch (error) {
      showErrorToast("Sản phẩm",error.message || "❌ Lỗi khi xóa sản phẩm.");
    }
  };

  const openDeleteModal = (id) => {
    setProductToDelete(id);
    setShowModal(true);
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setProductToDelete(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
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
        <Col md={12}>
          <div className="d-flex align-items-center">
            <FaBoxOpen
              className="me-2"
              size={25}
              style={{ color: "#1d41ff" }}
            />
            <h4 className="fw-bold">Sản phẩm</h4>
          </div>
          {message && <div className="alert alert-info">{message}</div>}
        </Col>
        
      </Row>

      {/* Filter Form */}
      <div className="mb-4">
        <Row>
          <Col xs={12} sm={4} md={3} className="mb-2">
            <Form.Control
              type="text"
              placeholder="🔍 Tìm tên / mã "
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
            />
          </Col>
          <Col xs={12} sm={4} md={2} className="mb-2">
            <Form.Select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">-- Tất cả trạng thái --</option>
              <option value="active">Hiển thị</option>
              <option value="inactive">Ẩn</option>
            </Form.Select>
          </Col>
          <Col xs={12} sm={4} md={7} className="text-md-end">
          {user?.role === "admin" && (
              <div >
                <Button variant="primary">
              <Link
                to={"/san-pham/them"}
                style={{ textDecoration: "none", color: "white" }}
                >
                  <FaPlus className="me-1" />
                Thêm sản phẩm
              </Link>
              </Button>
               <Button className="m-2" variant="success" onClick={exportProductsExcel}>
                <FaFileExport className="me-1" />
                Xuất Excel
              </Button>
            </div>
          )}
        </Col>
        </Row>
      </div>

      {/* Product List */}
      <Table bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Mã sản phẩm</th>
            <th>Ảnh</th>

            <th>Tên</th>
            <th>Giá</th>
            <th>Danh mục</th>
            {user?.role === "admin" && (
              <th>Code</th>
            )}
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="9" className="text-center">
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : (
            products.map((prod, index) => (
              <tr key={`${prod.id}-${index}`}>
                <td>{`SP180703${prod.id}`}</td>
                <td>
                  {prod.image && (
                    <img
                      src={`${URL_WEB}/uploads/${prod.image}`}
                      alt="Ảnh sản phẩm"
                      width={70}
                      className="img-fluid rounded"
                    />
                  )}
                </td>
                <td>{prod.name}</td>

                <td> {Number(prod.price).toLocaleString("vi-VN")}₫</td>
                <td>{prod.categoryName}</td>
                {user?.role === "admin" && (
                  <td>{prod.couponCode ? prod.couponCode : "Không có mã"}</td>
                )}
                <td className="d-flex">
                  <OverlayTrigger overlay={<Tooltip>Xem chi tiết</Tooltip>}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      as={Link}
                      to={`/san-pham/details/${prod.id}`}
                    >
                      <FaRegEye />
                    </Button>
                  </OverlayTrigger>
                  {user?.role === "admin" && (
                    <>
                      <OverlayTrigger overlay={<Tooltip>Sửa</Tooltip>}>
                        <Button
                          variant="outline-primary"
                          as={Link}
                          to={`/san-pham/sua/${prod.id}`}
                          className="me-2"
                        >
                          <MdOutlineAutoFixHigh />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger overlay={<Tooltip>Xóa</Tooltip>}>
                        <Button
                          variant="outline-danger"
                          onClick={() => openDeleteModal(prod.id)}
                        >
                          <MdDelete />
                        </Button>
                      </OverlayTrigger>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <small>{totalProducts} sản phẩm</small>
        </div>
        <Pagination className="d-flex justify-content-center">
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

      {/* Modal xác nhận xóa */}
      <Modal show={showModal} onHide={closeDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn xóa sản phẩm này không?</Modal.Body>
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

export default DanhSachSanPham;
