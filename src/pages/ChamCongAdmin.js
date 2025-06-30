import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Container,
  Table,
  Button,
  Form,
  Row,
  Col,
  Spinner,
  Card,
  Modal,
  Alert,
} from "react-bootstrap";
import {
  getChamCongByDate,
  exportChamCongByMonth,
  getSalarySummary,
  saveSalary,
  checkSalarySaved,
} from "../api/chamcongApi";
import { saveAs } from "file-saver";
import "../assets/ChamCongAdmin.css";
const formatDate = (date) => date.toISOString().split("T")[0];
const formatDisplayDate = (date) => date.toLocaleDateString("vi-VN");
const ChamCongAdmin = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [chamCongData, setChamCongData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

  const fetchData = async (date) => {
    setLoading(true);
    const res = await getChamCongByDate(formatDate(date));
    if (res.success) setChamCongData(res.data);
    else setChamCongData([]);
    setLoading(false);
  };

  const handleExport = async () => {
    setExporting(true);
    const res = await exportChamCongByMonth(selectedMonth);
    if (res) {
      const filename = `ChamCong_${selectedMonth}.xlsx`;
      saveAs(new Blob([res.data]), filename);
    } else {
      alert("Không thể xuất file Excel.");
    }
    setExporting(false);
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const [salaryDetail, setSalaryDetail] = useState(null);
  const [showSalaryDetailModal, setShowSalaryDetailModal] = useState(false);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedEmployeeEmail, setSelectedEmployeeEmail] = useState("");

  const handleViewSalaryDetail = async (emp) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    try {
      const res = await getSalarySummary(emp.id, year, month);
      const check = await checkSalarySaved(emp.id, year, month);

      setSalaryDetail({
        ...res.data,
        user_id: emp.id,
        full_name: emp.full_name,
        email: emp.email,
        year,
        month,
        saved: check.saved,
      });

      setSelectedEmployeeName(emp.full_name);
      setShowSalaryDetailModal(true);
    } catch (err) {
      alert("Không thể lấy dữ liệu lương");
    }
  };
  // const handleSaveSalary = async () => {
  //   const now = new Date();
  //   const year = now.getFullYear();
  //   const month = now.getMonth() + 1;

  //   try {
  //     await saveSalary({
  //       ...salaryDetail,
  //       user_id: selectedEmployeeId,
  //       full_name: selectedEmployeeName,
  //       email: selectedEmployeeEmail,
  //       year,
  //       month,
  //     });
  //     alert("✅ Đã lưu lương vào hệ thống");
  //   } catch (err) {
  //     alert("❌ Lỗi khi lưu lương");
  //   }
  // };
  const handleSaveSalary = async () => {
    if (saving || salaryDetail?.saved) return; // tránh double-click

    setSaving(true);
    setMessage("");

    try {
      const res = await saveSalary(salaryDetail);
      setMessage("✅ Lưu lương thành công!");
      setSalaryDetail((prev) => ({ ...prev, saved: true }));
      setShowSalaryDetailModal(false);
    } catch (err) {
      if (err.response?.status === 409) {
        setMessage("⚠️ Lương đã được lưu trước đó.");
      } else {
        setMessage("❌ Lỗi khi lưu lương");
      }
    } finally {
      setSaving(false);
    }
  };
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  return (
    <div className="container-fluid my-4" style={{ paddingLeft: "35px" }}>
      <h3 className="mb-4 text-primary">📅 Quản lý chấm công</h3>
      {message && (
        <Alert variant="info" className="mt-2">
          {message}
        </Alert>
      )}
      <Row>
        {/* Cột lịch */}
        <Col md={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Card.Title>Chọn ngày</Card.Title>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                locale="vi-VN"
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Cột dữ liệu phụ */}
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Form>
                <Form.Group controlId="monthExport">
                  <Form.Label>📤 Xuất Excel theo tháng:</Form.Label>
                  <Form.Control
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </Form.Group>
                <Button
                  variant="success"
                  className="mt-3 w-100"
                  onClick={handleExport}
                  disabled={exporting}
                >
                  {exporting ? "Đang xuất..." : "Xuất file Excel"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Card className="shadow-sm">
        <Card.Body>
          <h5>
            Dữ liệu ngày: <strong>{formatDisplayDate(selectedDate)}</strong>
          </h5>

          {loading ? (
            <div className="text-center py-5  d-flex justify-content-center align-items-center h-100">
                     <Spinner animation="border" variant="primary" />
                   </div>
          ) : (
            <Table striped bordered hover responsive className="mt-3">
              <thead className="table-dark">
                <tr>
                  <th>STT</th>
                  <th>Họ tên</th>
                  <th>Phòng ban</th>
                  <th>Vị trí</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {chamCongData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  chamCongData.map((nv, index) => (
                    <tr key={nv.id}>
                      <td>{index + 1}</td>
                      <td>{nv.full_name}</td>
                      <td>{nv.department}</td>
                      <td>{nv.position}</td>
                      <td>
                        {nv.check_in_time
                          ? formatDateTime(nv.check_in_time)
                          : "Chưa check-in"}
                      </td>
                      <td>
                        {nv.check_out_time
                          ? formatDateTime(nv.check_out_time)
                          : "Chưa check-out"}
                      </td>
                      <td>
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => handleViewSalaryDetail(nv)}
                        >
                          💰 Xem lương
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      {/* Modal chi tiết lương */}
      <Modal
        show={showSalaryDetailModal}
        onHide={() => setShowSalaryDetailModal(false)}
        centered
        className="salary-modal "
      >
        <Modal.Header closeButton>
          <Modal.Title>
            💼 Lương tháng hiện tại - {selectedEmployeeName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {salaryDetail ? (
            <ul>
              <li>
                👨‍💼 <strong>Ngày công:</strong>{" "}
                <strong>{salaryDetail.soNgayCong} ngày</strong>
              </li>
              <li>
                ⏱️ <strong>Tổng giờ làm:</strong>{" "}
                <strong>{salaryDetail.tongGio}h</strong>
              </li>
              <li>
                🐌 <strong>Đi trễ:</strong>{" "}
                <strong>{salaryDetail.soLanTre} lần</strong>
              </li>
              <li>
                🏃‍♂️ <strong>Về sớm:</strong>{" "}
                <strong>{salaryDetail.soLanVeSom} lần</strong>
              </li>
              <li>
                🕗 <strong>Tăng ca:</strong>{" "}
                <strong>{salaryDetail.tongGioTangCa}h</strong>
              </li>
              <li>
                💰 <strong>Lương chính:</strong>{" "}
                <strong>{salaryDetail.luongNgay.toLocaleString()}đ</strong>
              </li>
              <li>
                ⚡ <strong>Lương tăng ca:</strong>{" "}
                <strong>{salaryDetail.luongTangCa.toLocaleString()}đ</strong>
              </li>
              <li>
                🏆 <strong>Tổng lương:</strong>{" "}
                <strong>{salaryDetail.tongLuong.toLocaleString()}đ</strong>
              </li>
            </ul>
          ) : (
            <p>Không có dữ liệu</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant={salaryDetail?.saved ? "success" : "primary"}
            onClick={handleSaveSalary}
            disabled={saving || salaryDetail?.saved}
          >
            {saving ? (
              <>
                <Spinner
                  animation="border"
                  size="sm"
                  role="status"
                  className="me-2"
                />
                Đang lưu...
              </>
            ) : salaryDetail?.saved ? (
              "✅ Đã lưu"
            ) : (
              "💾 Lưu lương"
            )}
          </Button>

          <Button
            variant="secondary"
            onClick={() => setShowSalaryDetailModal(false)}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ChamCongAdmin;
