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
    OverlayTrigger,
} from "react-bootstrap";
import { MdDelete, MdOutlineAutoFixHigh } from "react-icons/md";
import { Link } from "react-router-dom";

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
      if (!file) return alert("Vui lòng chọn file Excel!");
  
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch(`${API}/ai/import-excel`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      console.log(result);

      if (result.success) {
        setMessage(`✅ Đã import ${result.inserted} dòng`);
        setFile(null);
        fetchRules();
      } else {
        setMessage("❌ Lỗi khi import file Excel");
      }
    };
  
    const handleExport = () => {
      window.open(`${API}/ai/export-excel`, "_blank");
  };
  //xóa
  const   openDeleteModal = (id) => {
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
          setMessage("🗑️ Xoá thành công");
          setShowModalDelete(false);
          setAiToDelete(null);
          fetchRules(); // làm mới lại danh sách rule
        } else {
          alert(result.message || "❌ Xoá thất bại.");
        }
      } catch (error) {
        alert("❌ Lỗi khi gọi API: " + error.message);
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
        setMessage("✅ Đã cập nhật thành công !");
        setShowModal(false);
        fetchRules();
      }
    };
  //gpt
    const handleGPTSuggest = async () => {
      const res = await fetch(`${API}/ai/suggest-gpt`);
      const result = await res.json();
      if (result.success) {
        setMessage("✨ Gợi ý GPT đã được thêm");
        fetchRules();
      }
    };
 
    const filtered = rules.filter((r) =>
      r.keyword.toLowerCase().includes(search.toLowerCase())
    );
  return (
      <div className="container-fluid my-4" style={{ paddingLeft: "35px" }}>
          <div className="p-4">
    <h4>🤖 Quản lý từ khóa phản hồi tự động</h4>
    {message && <Alert variant="info" className="mt-3">{message}</Alert>}
    <InputGroup className="mb-3 mt-3">
      <FormControl
        placeholder="Tìm từ khóa..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Button onClick={handleExport}>📤 Xuất Excel</Button>
      <Button onClick={handleGPTSuggest} variant="success" className="ms-2">
        ✨ Gợi ý GPT
      </Button>
    </InputGroup>

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
            <td>{r.id}</td>
            <td>{r.keyword}</td>
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
                            onClick={() => openDeleteModal(r.id)}>
                             <MdDelete />
                        </Button>
                     </OverlayTrigger>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>

    <hr />
    <Form.Group>
      <Form.Label>📁 Import từ Excel (.xlsx)</Form.Label>
      <Form.Control
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files[0])}
      />
    </Form.Group>
    <Button className="mt-2" onClick={handleUpload}>
      📤 Import
    </Button>

    <Modal show={showModalDelete} onHide={closeDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa đoạn văn bản</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn xóa đoạn văn bản này không?</Modal.Body>
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
              setEditingRule((prev) => ({ ...prev, keyword: e.target.value }))
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
      </div>
      </div>
  )
}

export default AutoReplyManager