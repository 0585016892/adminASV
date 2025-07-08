import React from "react";
import { Spinner, Modal, Button, Badge ,Row,Col} from "react-bootstrap";

const PostDetailModal = ({ show, onHide, post,loading = false }) => {
  if (!post) return null;

  const statusColor = post.status === "published" ? "success" : "secondary";

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          📖 <span className="fw-bold">Chi tiết bài viết</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
  {loading ? (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Đang tải...</span>
      </Spinner>
    </div>
  ) : (
    <>
      <h4 className="mb-2">{post.title}</h4>
      <div className="mb-3">
        <Badge bg="info" className="me-2">
          Danh mục: {post.category || "Không có"}
        </Badge>
        <Badge bg={statusColor}>
          {post.status === "published" ? "✅ Hiển thị" : "❌ Nháp"}
        </Badge>
      </div>

      <hr />

      <div className="mb-3">
        <h6 className="fw-semibold text-muted">📝 Nội dung:</h6>
        <div
          className="p-3 border rounded bg-light"
          style={{ minHeight: 120 }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
              </div>
          <hr />
              
              <Row>
                <Col md={6}>
                {post.images?.length > 0 && (
        <>
          <div className="mb-2">
            <h6 className="fw-semibold text-muted">🖼️ Hình ảnh:</h6>
            <div className="d-flex flex-wrap gap-2">
              {post.images.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 5,
                    padding: 4,
                    background: "#f9f9f9",
                  }}
                >
                  <img
                    src={`${process.env.REACT_APP_WEB_URL}${img}`}
                    alt={`Hình ${idx + 1}`}
                    style={{
                      height: 100,
                      width: "auto",
                      borderRadius: 4,
                      display: "block",
                    }}
                  />
                </div>
              ))}
            </div>
                  </div>
                  
        </>
      )}</Col>
                <Col md={6}>
                <div className="mb-2">
            <h6 className="fw-semibold text-muted">🖼️ Hình ảnh chính:</h6>
            <div className="d-flex flex-wrap gap-2">
             
                <div
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 5,
                    padding: 4,
                    background: "#f9f9f9",
                  }}
                >
                  <img
                    src={`${process.env.REACT_APP_WEB_URL}${post.image}`}
                    alt={`Hình  1}`}
                    style={{
                      height: 100,
                      width: "auto",
                      borderRadius: 4,
                      display: "block",
                    }}
                  />
                </div>
            </div>
          </div></Col>
</Row>
   
    </>
  )}
</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PostDetailModal;
