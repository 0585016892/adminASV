import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Form,
  Row,
  Col,
  Pagination,
  Modal,
  Tooltip,
  OverlayTrigger,
  Spinner,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { filterPosts, deletePost, updatePostStatus } from "../api/postAPI";
import { MdDelete, MdOutlineAutoFixHigh } from "react-icons/md";
import { FaRegEye, FaPlus } from "react-icons/fa6";
import { PostModal, PostDetailModal } from "../components";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const DanhSachBaiViet = () => {
  const [posts, setPosts] = useState([]);
  const [filters, setFilters] = useState({
    keyword: "",
    page: 1,
    limit: 6,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await filterPosts(filters);
      setPosts(Array.isArray(data.posts) ? data.posts : []);
      setTotalPosts(data.totalPosts || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      showErrorToast("Lỗi khi fetch bài viết:", err);
      setPosts([]);
      setTotalPosts(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (pageNumber) => {
    setFilters((prev) => ({ ...prev, page: pageNumber }));
    setCurrentPage(pageNumber);
  };

  const openDeleteModal = (id) => {
    setPostToDelete(id);
    setShowModal(true);
  };

  const closeDeleteModal = () => {
    setPostToDelete(null);
    setShowModal(false);
  };

  const handleDelete = async () => {
    try {
      await deletePost(postToDelete);
      fetchData();
      showSuccessToast("Tin tức blog", "Xóa bài viết thành công");
      closeDeleteModal();
    } catch (err) {
      showErrorToast("Lỗi khi xóa bài viết:", err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updatePostStatus(id, newStatus);
      fetchData();
      showSuccessToast("Tin tức blog", "Thay đổi trạng thái thành công");
    } catch (err) {
      showErrorToast("Tin tức blog", "Thay đổi trạng thái không thành công");
    }
  };

  return (
    <div className="container-fluid my-4" style={{ paddingLeft: "35px" }}>
      <Row className="align-items-center mb-4">
        <Col md={8}>
          <h4 className="fw-bold text-primary">📚 Danh sách bài viết</h4>
          <p className="text-muted mb-0">
            Quản lý và cập nhật các bài viết mới nhất
          </p>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-4">
            <Form.Control
              type="text"
              placeholder="🔍 Tìm kiếm theo tiêu đề hoặc danh mục..."
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
            />
          </Form.Group>
        </Col>
        <Col md={4} className="text-end">
          <Button
            variant="primary"
            onClick={() => {
              setEditData(null);
              setShowModalAdd(true);
            }}
          >
            <FaPlus className="me-1" /> Thêm bài viết
          </Button>
        </Col>
      </Row>

      {/* ✅ Loading Spinner */}
      {loading ? (
        <div className="text-center py-5 my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          <Table
            striped
            hover
            responsive
            bordered
            className="rounded shadow-sm text-center"
          >
            <thead  className="table-dark">
              <tr>
                <th>#</th>
                <th>Tiêu đề</th>
                <th>Danh mục</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    Không có bài viết nào.
                  </td>
                </tr>
              ) : (
                posts.map((post, index) => (
                  <tr key={post.id}>
                    <td>{(filters.page - 1) * filters.limit + index + 1}</td>
                    <td>{post.title}</td>
                    <td>
                      {post.category || <i className="text-muted">Không có</i>}
                    </td>
                    <td style={{ maxWidth: 150 }}>
                      <Form.Select
                        size="sm"
                        className={
                          post.status === "published"
                            ? "text-success"
                            : "text-secondary"
                        }
                        value={post.status}
                        onChange={(e) =>
                          handleStatusChange(post.id, e.target.value)
                        }
                      >
                        <option value="draft">Nháp</option>
                        <option value="published">Hiển thị</option>
                      </Form.Select>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <OverlayTrigger overlay={<Tooltip>Xem chi tiết</Tooltip>}>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              setSelectedPost(post);
                              setShowDetailModal(true);
                            }}
                          >
                            <FaRegEye />
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger overlay={<Tooltip>Sửa</Tooltip>}>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => {
                              setEditData(post);
                              setShowModalAdd(true);
                            }}
                          >
                            <MdOutlineAutoFixHigh />
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger overlay={<Tooltip>Xóa</Tooltip>}>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => openDeleteModal(post.id)}
                          >
                            <MdDelete />
                          </Button>
                        </OverlayTrigger>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">{totalPosts} bài viết</small>
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
              <Pagination.Last
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>
        </>
      )}

      {/* Modal Xác nhận xóa */}
      <Modal show={showModal} onHide={closeDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa bài viết</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn xóa bài viết này không?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal thêm / sửa bài */}
      <PostModal
        show={showModalAdd}
        onHide={() => setShowModalAdd(false)}
        initialData={editData}
        onSuccess={fetchData}
      />

      {/* Modal xem chi tiết */}
      <PostDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        post={selectedPost}
      />
    </div>
  );
};

export default DanhSachBaiViet;
