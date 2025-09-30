import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Button,
  Badge,
  Form,
  Row,
  Col,
  Pagination,
  Card,
  Spinner,
  Modal,
  Image,
} from "react-bootstrap";
import { FaStar, FaRegStar, FaTrash, FaCheck } from "react-icons/fa";
import reviewApi from "../api/reviewApi";
import { io } from "socket.io-client";

function AdminReviews() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });
const [filters, setFilters] = useState({ rating: "", status: "all" });
  const [loading, setLoading] = useState(false);

  const [showProductModal, setShowProductModal] = useState(false);
  const [productReviews, setProductReviews] = useState([]);
  const [productName, setProductName] = useState("");

  const [deleteReviewId, setDeleteReviewId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const URL = process.env.REACT_APP_WEB_URL;
  const socketRef = useRef(null);

  // Khởi tạo socket chỉ 1 lần
  useEffect(() => {
    socketRef.current = io(URL);

    socketRef.current.on("newReview", () => loadProducts(pagination.page));
    socketRef.current.on("approveReview", () => loadProducts(pagination.page));
    socketRef.current.on("reviewDeleted", () => loadProducts(pagination.page));

    return () => {
      socketRef.current.disconnect();
    };
  }, [pagination.page, URL]);

  // Load danh sách sản phẩm có review
  useEffect(() => {
    loadProducts(1);
  }, [filters]);

  const loadProducts = async (page) => {
    setLoading(true);
    try {
      const res = await reviewApi.getAllReviews({
        page,
        limit: pagination.limit,
        rating: filters.rating,
      });
      console.log(res);
      
      setProducts(res.data || []);
      setPagination(res.pagination || pagination);
    } catch (err) {
      console.error("Lỗi load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  // Xem chi tiết review sản phẩm
  const handleViewProductReviews = async (productId, productName) => {
    try {
      const res = await reviewApi.getAllReviews({ productId, limit: 50 });
      const parsedReviews = (res.data || []).map((rv) => ({
        ...rv,
        images: rv.images ? safeJsonParse(rv.images) : [],
      }));
      setProductReviews(parsedReviews);
      setProductName(productName);
      setShowProductModal(true);
    } catch (err) {
      
    }
  };

  const safeJsonParse = (str) => {
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
// Lọc ở frontend sau khi load API
  const filteredProducts = products.filter((p) => {
    if (filters.status === "pending") return p.pending_reviews > 0;
    if (filters.status === "done") return p.pending_reviews === 0;
    return true;
  });
  const handleApprove = async (id) => {
    try {
      await reviewApi.approveReview(id);
      socketRef.current.emit("approveReview", id);
      setProductReviews((prev) =>
        prev.map((rv) => (rv.id === id ? { ...rv, is_verified: 1 } : rv))
      );
      loadProducts(pagination.page);
    } catch (error) {
      
    }
  };

  const openDeleteModal = (id) => {
    setDeleteReviewId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setDeleteReviewId(null);
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    if (!deleteReviewId) return;
    try {
      await reviewApi.deleteReview(deleteReviewId);
      socketRef.current.emit("reviewDeleted", deleteReviewId);
      closeDeleteModal();
      setProductReviews((prev) =>
        prev.filter((rv) => rv.id !== deleteReviewId)
      );
      loadProducts(pagination.page);
    } catch (err) {
      
    }
  };

  return (
    <div className="container-fluid my-4" style={{ paddingLeft: "35px" }}>
      <h4 className="fw-bold mb-4">Quản lý đánh giá</h4>

      {/* Bộ lọc */}
      <Card className="mb-3 p-3 shadow-sm rounded-3">
        <Row className="align-items-end g-3">
          <Col md={3}>
            <Form.Label>Số sao</Form.Label>
            <Form.Select
              name="rating"
              value={filters.rating}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả</option>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} sao
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={3}>
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="all">Tất cả</option>
              <option value="pending">Đánh giá chưa duyệt</option>
              <option value="done">Đã duyệt hết</option>
            </Form.Select>
          </Col>
        </Row>
      </Card>


      {/* Bảng danh sách sản phẩm có review */}
      <Card className="shadow-sm rounded-3">
        <Table striped bordered hover responsive className="mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Sản phẩm</th>
                <th>Tổng đánh giá</th>
                <th>Chưa duyệt</th>
                <th>Điểm trung bình</th>
                <th>Ngày review mới nhất</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center">
                    <Spinner animation="border" />
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">
                    Không có đánh giá nào
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.product_id}>
                    <td>{p.product_id}</td>
                    <td>{p.product_name}</td>
                    <td>{p.total_reviews}</td>
                    <td>
                      {p.pending_reviews > 0 ? (
                        <Badge bg="warning">{p.pending_reviews} chưa duyệt</Badge>
                      ) : (
                        <Badge bg="success">Đã duyệt hết</Badge>
                      )}
                    </td>
                    <td>
                      {[1, 2, 3, 4, 5].map((star) =>
                        star <= Math.round(p.avg_rating) ? (
                          <FaStar key={star} color="#ffc107" />
                        ) : (
                          <FaRegStar key={star} color="#ccc" />
                        )
                      )}
                    </td>
                    <td>
                      {p.last_review_date
                        ? new Date(p.last_review_date).toLocaleDateString("vi-VN")
                        : "-"}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() =>
                          handleViewProductReviews(p.product_id, p.product_name)
                        }
                      >
                        Xem chi tiết
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>



        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="d-flex justify-content-end mt-3 mb-3">
            <Pagination>
              {[...Array(pagination.totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <Pagination.Item
                    key={page}
                    active={page === pagination.page}
                    onClick={() => loadProducts(page)}
                  >
                    {page}
                  </Pagination.Item>
                );
              })}
            </Pagination>
          </div>
        )}
      </Card>

      {/* Modal chi tiết review sản phẩm */}
      <Modal
        size="lg"
        show={showProductModal}
        onHide={() => setShowProductModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Danh sách đánh giá của sản phẩm: {productName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {productReviews.length === 0 ? (
            <p>Chưa có đánh giá nào.</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead  className="table-dark">
                <tr>
                  <th>Người đánh giá</th>
                  <th>Sao</th>
                  <th>Nội dung</th>
                  <th>Ảnh</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {productReviews.map((rv) => (
                  <tr key={rv.id}>
                    <td>
                      <strong>{rv.full_name}</strong>
                      <div className="text-muted small">{rv.phone}</div>
                    </td>
                    <td>
                      {[1, 2, 3, 4, 5].map((star) =>
                        star <= rv.rating ? (
                          <FaStar key={star} color="#ffc107" />
                        ) : (
                          <FaRegStar key={star} color="#ccc" />
                        )
                      )}
                    </td>
                    <td style={{ maxWidth: "250px", whiteSpace: "pre-wrap" }}>
                      {rv.content}
                    </td>
                    <td>
                      {rv.images && rv.images.length > 0 ? (
                        <Row className="g-1">
                          {rv.images.map((img, i) => (
                            <Col xs={12} key={i}>
                              <Image
                                src={`${URL}/uploads/reviews/${img}`}
                                rounded
                                thumbnail
                                style={{
                                  width: "100%",
                                  height: "60px",
                                  objectFit: "cover",
                                }}
                              />
                            </Col>
                          ))}
                        </Row>
                      ) : (
                        <span className="text-muted">Không có</span>
                      )}
                    </td>
                    <td>
                      {new Date(rv.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td>
                      {rv.is_verified ? (
                        <Badge bg="success">Đã duyệt</Badge>
                      ) : (
                        <Badge bg="secondary">Chưa duyệt</Badge>
                      )}
                    </td>
                    <td>
                      {!rv.is_verified && (
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => handleApprove(rv.id)}
                        >
                          <FaCheck /> Duyệt
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => openDeleteModal(rv.id)}
                      >
                        <FaTrash /> Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal Xác nhận xóa */}
      <Modal show={showDeleteModal} onHide={closeDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa đánh giá</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa đánh giá này không?
        </Modal.Body>
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
}

export default AdminReviews;
