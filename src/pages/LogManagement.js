import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Badge, Form, Row, Col, Spinner, Pagination } from "react-bootstrap";
import axios from "axios";
import { parseUserAgent } from "../ultis/parseUserAgent";

const roleMap = { admin: "Quản trị viên", staff: "Nhân viên", hr: "Nhân sự" };
const actionColors = { create: "success", update: "warning", delete: "danger", login: "primary" };

const LogManagement = () => {
  const API_URL_LOGIN = process.env.REACT_APP_API_URL;
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // tháng từ 0 → 11
  const dd = String(today.getDate()).padStart(2, '0');

  const [filters, setFilters] = useState({
    user_id: "",
    action: "",
    module: "",
    role: "",
    date_from: "",
    date_to: `${yyyy}-${mm}-${dd}` // format YYYY-MM-DD
  });
  const limit = 20;

  const fetchLogs = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL_LOGIN}/log/logs`, { params: { ...filters, page: pageNumber, limit } });
      if (data.success) {
        setLogs(data.data);
        setTotal(data.total);
        setPage(data.page);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(1); }, [filters]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const totalPages = Math.ceil(total / limit);

  const renderDetail = (log) => {
    if (!log.old_data && !log.new_data) return <p>Không có dữ liệu chi tiết</p>;
    const oldData = log.old_data ? JSON.parse(log.old_data) : {};
    const newData = log.new_data ? JSON.parse(log.new_data) : {};
    const keys = Array.from(new Set([...Object.keys(oldData), ...Object.keys(newData)]));
    return (
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Trường</th>
            <th>Cũ</th>
            <th>Mới</th>
          </tr>
        </thead>
        <tbody>
          {keys.map(k => (
            <tr key={k}>
              <td>{k}</td>
              <td>{oldData[k] || "-"}</td>
              <td style={{ backgroundColor: oldData[k] !== newData[k] ? "#fff3cd" : "transparent" }}>{newData[k] || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="container mt-4">
      <h3>Quản lý Log hệ thống</h3>

      {/* Filter trực tiếp */}
      <Row className="mb-3 g-2">
        <Col md={2}><Form.Control placeholder="User ID" name="user_id" value={filters.user_id} onChange={handleFilterChange} /></Col>
        <Col md={2}><Form.Control placeholder="Action" name="action" value={filters.action} onChange={handleFilterChange} /></Col>
        <Col md={2}><Form.Control placeholder="Module" name="module" value={filters.module} onChange={handleFilterChange} /></Col>
        <Col md={2}>
          <Form.Select name="role" value={filters.role} onChange={handleFilterChange}>
            <option value="">Tất cả role</option>
            {Object.entries(roleMap).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
          </Form.Select>
        </Col>
        <Col md={2}><Form.Control type="date" name="date_from" value={filters.date_from} onChange={handleFilterChange} /></Col>
        <Col md={2}><Form.Control type="date" name="date_to" value={filters.date_to} onChange={handleFilterChange} /></Col>
      </Row>

      {/* Table log */}
      {loading ? <Spinner animation="border" /> :
        <Table striped bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Người thao tác</th>
              <th>Role</th>
              <th>Action</th>
              <th>Module</th>
              <th>Mô tả</th>
              <th>User Agent</th>
              <th>Thời gian</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className={log.user_id ? "" : "text-muted fst-italic"}>
                <td>{log.id}</td>
                <td>{log.full_name || "System"}</td>
                <td>{roleMap[log.role] || "-"}</td>
                <td><Badge bg={actionColors[log.action] || "secondary"}>{log.action}</Badge></td>
                <td>{log.module}</td>
                <td>{log.description}</td>
                <td>{parseUserAgent(log.user_agent)}</td>
                <td>{new Date(log.created_at).toLocaleString()}</td>
                <td><Button size="sm" onClick={() => setSelectedLog(log)}>Xem</Button></td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan="9" className="text-center text-muted">Không có dữ liệu</td></tr>}
          </tbody>
        </Table>
      }

      {/* Pagination */}
      <Pagination>
        <Pagination.Prev disabled={page===1} onClick={() => fetchLogs(page-1)} />
        {[...Array(totalPages)].map((_, i) => <Pagination.Item key={i+1} active={page===i+1} onClick={() => fetchLogs(i+1)}>{i+1}</Pagination.Item>)}
        <Pagination.Next disabled={page===totalPages} onClick={() => fetchLogs(page+1)} />
      </Pagination>

      {/* Modal chi tiết */}
      <Modal show={!!selectedLog} onHide={() => setSelectedLog(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết log #{selectedLog?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{selectedLog && renderDetail(selectedLog)}</Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setSelectedLog(null)}>Đóng</Button></Modal.Footer>
      </Modal>
    </div>
  );
};

export default LogManagement;
