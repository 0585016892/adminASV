import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Form,
  InputGroup,
  FormControl,
  Alert,
  Modal,
  Tooltip,
  Row,
  Col,
  OverlayTrigger,
} from "react-bootstrap";
import { MdDelete, MdOutlineAutoFixHigh } from "react-icons/md";
import { Link } from "react-router-dom";
import { showSuccessToast, showErrorToast } from "../ultis/toastUtils";

const API = process.env.REACT_APP_API_URL;

const AutoReplyManager = () => {
  const [rules, setRules] = useState([]);
  const [search, setSearch] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [aiToDelete, setAiToDelete] = useState(null);

  const [editingRule, setEditingRule] = useState(null); // rule đang sửa
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);

  const fetchRules = async () => {
    const res = await fetch(`${API}/ai`);
    const data = await res.json();
    setRules(data);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleUpload = async () => {
    if (!file) return setMessage("Vui lòng chọn file Excel!");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API}/ai/import-excel`, {
      method: "POST",
      body: formData,
    });
    const result = await res.json();

    if (result.success) {
      showSuccessToast("Import Excel", `Đã import ${result.inserted} dòng`);
      setFile(null);
      fetchRules();
    } else {
      showErrorToast("Import Excel", "Lỗi khi import file Excel");
    }
  };

  const handleExport = () => {
    window.open(`${API}/ai/export-excel`, "_blank");
  };
  //xóa
  const openDeleteModal = (id) => {
    setAiToDelete(id);
    setShowModalDelete(true);
  };

  const closeDeleteModal = () => {
    setShowModalDelete(false);
    setAiToDelete(null);
  };

  const handleDelete = async () => {
    if (!aiToDelete) return;

    try {
      const res = await fetch(`${API}/ai/delete/${aiToDelete}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const text = await res.text(); // debug HTML nếu có
        throw new Error(`Server error: ${text}`);
      }

      const result = await res.json();

      if (result.success) {
        showSuccessToast("Xoá câu lệnh", "🗑️ Xoá thành công");
        setShowModalDelete(false);
        setAiToDelete(null);
        fetchRules(); // làm mới lại danh sách rule
      } else {
        showErrorToast("Xoá câu lệnh", result.message || "❌ Xoá thất bại.");
      }
    } catch (error) {
      setMessage("❌ Lỗi khi gọi API: " + error.message);
    }
  };
  //sửa
  const openEditModal = (rule) => {
    setEditingRule(rule);
    setShowModal(true);
  };

  const handleSaveEdit = async () => {
    const res = await fetch(`${API}/ai/update/${editingRule.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingRule),
    });
    const result = await res.json();
    if (result.success) {
      showSuccessToast("Cập nhật", "✅ Đã cập nhật thành công!");
      setShowModal(false);
      fetchRules();
    }else {
      showErrorToast("Cập nhật", "❌ Cập nhật thất bại!");
    }
  };
  //gpt
  const [showGPTModal, setShowGPTModal] = useState(false);
  const [gptPrompt, setGptPrompt] = useState(
    "Gợi ý câu trả lời cho chatbot bán quần áo."
  );
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const handleGPTSuggest = async () => {
    try {
      const res = await fetch(`${API}/ai/suggest-gpt`);
      const result = await res.json();
      if (result.success) {
        setMessage("✨ Gợi ý từ GPT đã được thêm");
        fetchRules(); // Tải lại rule mới
      } else {
        alert("❌ Lỗi khi gọi GPT");
      }
    } catch (err) {
      console.error("GPT Error:", err);
      alert("❌ Lỗi server GPT");
    }
  };
  const handleGeminiSuggest = async () => {
    setLoadingSuggest(true);
    try {
      const res = await fetch(`${API}/ai/suggest-gemini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: gptPrompt }),
      });

      const result = await res.json();
      if (result.success) {
        showSuccessToast("Gemini", `✨ Đã thêm ${result.inserted} câu trả lời`);
        setShowGPTModal(false);
        fetchRules();
      } else {
        showErrorToast("Gemini", result.message || "❌ Lỗi khi gọi Gemini");
      }
    } catch (err) {
      showErrorToast("❌ Lỗi khi gọi Gemini: " + err.message);
    }
    setLoadingSuggest(false);
  };

  const filtered = rules?.filter((r) =>
    !search || (r.chatbot_replies && r.chatbot_replies.toLowerCase().includes(search.toLowerCase()))
  ) || [];
  
  
  return (
    <div className="container-fluid my-4" style={{ paddingLeft: "35px" }}>
      <div className="p-4">
        <h4>🤖 Quản lý từ khóa phản hồi tự động</h4>
        {message && (
          <Alert variant="info" className="mt-3">
            {message}
          </Alert>
        )}
        <Row>
          <Col md={6}>
            <InputGroup className="mb-3 mt-3">
              <FormControl
                placeholder="Tìm từ khóa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleExport}>📤 Xuất Excel</Button>
              <Button
                onClick={() => setShowGPTModal(true)}
                variant="success"
                className="ms-2"
              >
                ✨ Gợi ý từ Gemini
              </Button>
            </InputGroup>
          </Col>
          <Col md={6}>
            <Row className="mb-3 mt-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Control
                    type="file"
                    accept=".xlsx"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Button className="ms-2" onClick={handleUpload}>
                  📤 Import
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <Table striped bordered hover>
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Từ khóa</th>
              <th>Phản hồi</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>CB821{r.id}</td>
                <td>{r.chatbot_replies}</td>
                <td>{r.reply}</td>
                <td>
                  <OverlayTrigger overlay={<Tooltip>Sửa</Tooltip>}>
                    <Button
                      variant="outline-primary"
                      as={Link}
                      onClick={() => openEditModal(r)}
                      className="me-2"
                    >
                      <MdOutlineAutoFixHigh />
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger overlay={<Tooltip>Xóa</Tooltip>}>
                    <Button
                      variant="outline-danger"
                      onClick={() => openDeleteModal(r.id)}
                    >
                      <MdDelete />
                    </Button>
                  </OverlayTrigger>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <hr />

        <Modal show={showModalDelete} onHide={closeDeleteModal}>
          <Modal.Header closeButton>
            <Modal.Title>Xác nhận xóa đoạn văn bản</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Bạn có chắc chắn muốn xóa đoạn văn bản này không?
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
        {/* Modal sửa */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>✏️ Sửa Rule</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Từ khoá</Form.Label>
              <Form.Control
                value={editingRule?.keyword || ""}
                onChange={(e) =>
                  setEditingRule((prev) => ({
                    ...prev,
                    keyword: e.target.value,
                  }))
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Phản hồi</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editingRule?.reply || ""}
                onChange={(e) =>
                  setEditingRule((prev) => ({ ...prev, reply: e.target.value }))
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleSaveEdit}>💾 Lưu</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>
        {/*modal germini*/}
        <Modal show={showGPTModal} onHide={() => setShowGPTModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>🤖 Gợi ý nội dung từ Gemini</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Nhập đề bài / prompt</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={gptPrompt}
                onChange={(e) => setGptPrompt(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowGPTModal(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleGeminiSuggest}
              disabled={loadingSuggest}
            >
              {loadingSuggest ? "Đang gửi..." : "Gợi ý & Lưu"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default AutoReplyManager;
