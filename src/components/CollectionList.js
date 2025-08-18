import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Card,
  Row,
  Col,
  Pagination,
  Badge,
  InputGroup,
  Modal
} from "react-bootstrap";
import CollectionModal from "./CollectionModal";
import {
  createCollection,
  updateCollection,
  deleteCollection,
  getCollections,
} from "../api/collectionApi";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";
import { FaPlus, FaFileExport } from "react-icons/fa";

const CollectionList = () => {
  const [collections, setCollections] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showModalDe, setShowModalDe] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [bSTToDelete, setBSTToDelete] = useState(null);

  // Gọi API lấy danh sách bộ sưu tập
  const fetchCollections = async () => {
    try {
      const res = await getCollections({
        search,
        status: statusFilter,
        page,
        limit: 6,
      });
      setCollections(res.data); // backend nên trả { data, totalPages }
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      showErrorToast("❌ Lỗi load collections:", err);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [search, statusFilter, page]);

  const handleDelete = async (id) => {
    if (!bSTToDelete) return;
    
        try {
          const result = await deleteCollection(bSTToDelete);
          setCollections((prevDanhmuc) =>
            prevDanhmuc.filter((prod) => prod.id !== bSTToDelete)
          );
          showSuccessToast("Bộ siêu tập",result.message);
          setShowModalDe(false);
        } catch (error) {
          showErrorToast("Bộ siêu tập",error.message || "Lỗi khi xóa sản phẩm.");
        }
  };

  const handleSave = async (formData) => {
    try {
      if (formData.id) {
        await updateCollection(formData.id, formData);
        showSuccessToast("Bộ Siêu tập","Cập nhật bộ sưu tập thành công");
      } else {
        await createCollection(formData);
        showSuccessToast("Bộ Siêu tập","Thêm bộ sưu tập thành công");
      }
      fetchCollections();
    } catch (err) {
      showErrorToast("❌ Lỗi lưu bộ sưu tập:", err);
    }
  };
  const openDeleteModal = (id) => {
    setBSTToDelete(id);
    setShowModalDe(true);
  };

  const closeDeleteModal = () => {
    setShowModalDe(false);
    setBSTToDelete(null);
  };
  return (
    <div className="p-4 bg-white rounded shadow-sm">
        <Row className="align-items-center mb-3">
                <Col>
                  <h4 className="fw-bold text-primary">📁 Bộ sưu tập</h4>
                </Col>
              
              </Row>

      {/* Bộ lọc */}
      <div>
          <Row className="mb-3 align-items-end">
        <Col md={3}>
          <InputGroup>
            <Form.Control
              placeholder="🔍 Tìm theo tên"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Kích hoạt</option>
            <option value="inactive">Ẩn</option>
          </Form.Select>
        </Col>
        <Col md={6} className="text-end">
        <Button
          variant="primary"
          onClick={() => {
            setEditItem(null);
            setShowModal(true);
          }}
        >
          <FaPlus className="me-1" />  Thêm bộ sưu tập
          </Button>
        </Col>
      </Row>
    </div>

      {/* Hiển thị danh sách bộ sưu tập */}
      <Row>
        {collections.map((col) => (
          <Col md={4} key={col.id} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Img
                variant="top"
                src={
                  col.image?.startsWith("http")
                    ? col.image
                    : `${process.env.REACT_APP_WEB_URL}/uploads/${col.image}`
                }
                style={{ height: "200px", objectFit: "cover" }}
              />
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Card.Title className="mb-0 fs-5">{col.name}</Card.Title>
                  <Badge bg={col.status === "active" ? "success" : "secondary"}>
                    {col.status === "active" ? "Kích hoạt" : "Ẩn"}
                  </Badge>
                </div>
                <Card.Text className="text-muted" style={{ minHeight: "60px" }}>
                  {col.description?.slice(0, 100)}...
                </Card.Text>
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => {
                      setEditItem(col);
                      setShowModal(true);
                    }}
                  >
                    ✏️ Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => openDeleteModal(col.id)}
                  >
                    🗑️ Xóa
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Phân trang */}
      {totalPages > 1 && (
        <Pagination className="justify-content-center mt-4">
          <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
          <Pagination.Prev
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          />
          {[...Array(totalPages)].map((_, idx) => (
            <Pagination.Item
              key={idx + 1}
              active={page === idx + 1}
              onClick={() => setPage(idx + 1)}
            >
              {idx + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          />
          <Pagination.Last
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          />
        </Pagination>
      )}

      <CollectionModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleSave}
        initialData={editItem}
      />
        <Modal show={showModalDe} onHide={closeDeleteModal}>
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

export default CollectionList;
