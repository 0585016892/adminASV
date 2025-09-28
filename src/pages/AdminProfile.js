import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ListGroup,
  Badge,
  Modal,
} from "react-bootstrap";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  FaEnvelope,
  FaPhone,
  FaEdit,
  FaLock,
  FaUserShield,
  FaCheckCircle,
} from "react-icons/fa";
import "../assets/CustomCalendar.css";
import "../assets/AdminProfile.css";
import { useAuth } from "../contexts/AuthContext";
import logo from "../img/admin.jpg";
import { getAttendanceByDate, checkIn, checkOut } from "../api/adminproApi";
import io from "socket.io-client";
import { Spinner } from "react-bootstrap";
const URL_WEB = process.env.REACT_APP_WEB_URL; // Cập nhật URL nếu khác
const socket = io(`${URL_WEB}`);
const AdminProfile = () => {
  const API_URL = process.env.REACT_APP_API_URL; // Cập nhật URL nếu khác
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [markedDates, setMarkedDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  //đổi mk
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập OTP + mật khẩu mới
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const otpRefs = useRef([]);
  const [newForgotPassword, setNewForgotPassword] = useState("");
  const [forgotMsg, setForgotMsg] = useState(null);
  const [otpTimer, setOtpTimer] = useState(600);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      socket.emit("join-user-room", user.id);

      socket.on("attendance-realtime", (data) => {
        console.log("🟢 Nhận chấm công:", data);
        // Hiển thị UI thông báo hoặc toast
      });

      return () => socket.disconnect();
    }
  }, [user]);
  const formatDateISO = (date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split("T")[0];
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchMarkedDatesForMonth = async (year, month) => {
    if (!user) return;
    setLoading(true);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dateStr = formatDateISO(dateObj);

      try {
        const res = await getAttendanceByDate(user.id, dateStr);
        if (res.success && res.data.length > 0) {
          const att = res.data[0];
          const status = att.check_out_time ? "checkout" : "checkin";
          dates.push({ date: dateStr, status });
        }
      } catch {}
    }

    setMarkedDates(dates);
    setLoading(false);
  };

  const fetchStatusForSelectedDate = async (date) => {
    const formatted = formatDateISO(date);
    try {
      const res = await getAttendanceByDate(user.id, formatted);
      if (res.success && res.data.length > 0) {
        const att = res.data[0];
        setIsCheckedIn(!!att.check_in_time);
        setIsCheckedOut(!!att.check_out_time);
        setModalData(att);
      } else {
        setIsCheckedIn(false);
        setIsCheckedOut(false);
        setModalData(null);
      }
    } catch {
      setIsCheckedIn(false);
      setIsCheckedOut(false);
      setModalData(null);
    }
  };

  useEffect(() => {
    if (user) {
      const y = currentMonth.getFullYear();
      const m = currentMonth.getMonth();
      fetchMarkedDatesForMonth(y, m);
      fetchStatusForSelectedDate(selectedDate);
    }
  }, [user, currentMonth, selectedDate]);

  const handleCheckIn = async () => {
    const dateStr = formatDateISO(selectedDate);
    setLoading(true);
    try {
      const res = await checkIn(user.id, dateStr);
      if (res.success) {
        showNotification("success", "Đã check-in!");
        setIsCheckedIn(true);
        setMarkedDates((prev) => [
          ...prev.filter((d) => d.date !== dateStr),
          { date: dateStr, status: "checkin" },
        ]);
      } else {
        showNotification("error", res.message || "Chấm công thất bại");
      }
    } catch {
      showNotification("error", "Lỗi khi gửi yêu cầu check-in.");
    }
    setLoading(false);
  };

  const handleCheckOut = async () => {
    const dateStr = formatDateISO(selectedDate);
    setLoading(true);
    try {
      const res = await getAttendanceByDate(user.id, dateStr);
      if (!res.success || res.data.length === 0) {
        showNotification("error", "Chưa check-in ngày này!");
        setLoading(false);
        return;
      }

      const attendanceId = res.data[0].id;
      const outRes = await checkOut(attendanceId);
      if (outRes.success && outRes.data.check_out_time) {
        setIsCheckedOut(true);
        showNotification(
          "success",
          `Đã check-out lúc ${new Date(
            outRes.data.check_out_time
          ).toLocaleTimeString("vi-VN")}`
        );
        setMarkedDates((prev) => [
          ...prev.filter((d) => d.date !== dateStr),
          { date: dateStr, status: "checkout" },
        ]);
      } else {
        showNotification("error", "Không thể check-out.");
      }
    } catch {
      showNotification("error", "Lỗi khi gửi yêu cầu check-out.");
    }
    setLoading(false);
  };

  const onDateClick = async (date) => {
    setSelectedDate(date);
    await fetchStatusForSelectedDate(date);
    setShowModal(true);
  };

  const isTodaySelected = (() => {
    const today = new Date();
    return (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    );
  })();

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const formatted = formatDateISO(date);
    const mark = markedDates.find((d) => d.date === formatted);

    return mark ? (
      <div className="text-center" style={{ fontSize: "1.2rem" }}>
        {mark.status === "checkin" ? (
          <span style={{ color: "#6f42c1" }}>🔵</span>
        ) : (
          <span style={{ color: "#198754" }}>🟢</span>
        )}
      </div>
    ) : null;
  };
  useEffect(() => {
    let interval;
    if (step === 2 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };
  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (!value) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động focus sang ô tiếp theo
    if (index < 5 && value) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      if (index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
  };
if (!user)
  return (
    <div className="text-center my-5 d-flex justify-content-center" style={{height:'87vh'}}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Đang tải...</span>
      </Spinner>
    </div>
  );
  return (
    <Container className="mt-4">
      <Row className="g-4">
        <Col md={4}>
          {/* Thông tin người dùng */}
          <Card className="text-center shadow border-0">
            <div className="pt-4">
              <img
                src={
                  user && user.avatar
                    ? `${URL_WEB}${user.avatar}`
                    : logo
                }
                alt="avatar"
                className="rounded-circle border"
                style={{ width: "130px", height: "130px", objectFit: "cover" }}
              />
            </div>
            <Card.Body>
              <Card.Title className="mb-1">{user.full_name}</Card.Title>
              <Badge bg="success" className="mb-2">
                <FaUserShield className="me-1" />
                {user.role}
              </Badge>
              <Card.Text>
                <strong>Nơi làm việc :</strong> {user.department}
              </Card.Text>
              <Card.Text>
                <strong>Trạng thái:</strong>{" "}
                <span className="text-success">
                  <FaCheckCircle className="me-1" />
                  {user.status === "active"
                    ? "Đang hoạt động"
                    : "Không hoạt động"}
                </span>
              </Card.Text>
              <Card.Text>
                <strong>Ngày tham gia:</strong>{" "}
                {new Date(user.created_at).toLocaleDateString("vi-VN")}
              </Card.Text>
              <div className="d-grid gap-2 mt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowForgotModal(true)}
                >
                  <FaLock className="me-1" />
                  Đổi mật khẩu
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          {/* Lịch chấm công */}
          <Card className="shadow border-0">
            <Card className="shadow border-0 mb-4">
              <Card.Header className="bg-primary text-white">
                Thông tin liên hệ
              </Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <FaEnvelope className="me-2 text-primary" />
                  <strong>Email:</strong> {user.email}
                </ListGroup.Item>
                <ListGroup.Item>
                  <FaPhone className="me-2 text-success" />
                  <strong>SĐT:</strong> {user.phone}
                </ListGroup.Item>
              </ListGroup>
            </Card>
            <Card.Body>
              <h3 className="mb-3">
                Lịch chấm công tháng {currentMonth.getMonth() + 1}
              </h3>
              <div className="mb-3 d-flex gap-3">
                <span>🔵 Check-in</span>
                <span>🟢 Check-out</span>
              </div>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                onActiveStartDateChange={({ activeStartDate }) =>
                  setCurrentMonth(activeStartDate)
                }
                tileContent={tileContent}
                onClickDay={onDateClick}
              />

              <div className="mt-3">
                <p>
                  Ngày: <b>{selectedDate.toLocaleDateString("vi-VN")}</b>
                </p>
                <p>
                  Trạng thái:{" "}
                  {isCheckedIn ? (
                    isCheckedOut ? (
                      <Badge bg="success">Đã checkout</Badge>
                    ) : (
                      <Badge bg="warning">Đã checkin</Badge>
                    )
                  ) : (
                    <Badge bg="secondary">Chưa chấm</Badge>
                  )}
                </p>

                {/* {isTodaySelected && (
                  <div className="d-flex gap-3">
                    {!isCheckedIn && (
                      <Button onClick={handleCheckIn} disabled={loading}>
                        Check-in
                      </Button>
                    )}
                    {isCheckedIn && !isCheckedOut && (
                      <Button onClick={handleCheckOut} disabled={loading}>
                        Check-out
                      </Button>
                    )}
                  </div>
                )} */}

                {notification && (
                  <div
                    className={`mt-3 alert alert-${
                      notification.type === "success" ? "success" : "danger"
                    }`}
                  >
                    {notification.message}
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Chi tiết ngày{" "}
            {modalData?.work_date
              ? new Date(modalData.work_date).toLocaleDateString("vi-VN")
              : selectedDate.toLocaleDateString("vi-VN")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalData ? (
            <>
              <div className="d-flex justify-content-between mb-3">
                <div>
                  <strong>Thời gian vào:</strong>{" "}
                  {modalData.check_in_time
                    ? new Date(modalData.check_in_time).toLocaleTimeString(
                        "vi-VN"
                      )
                    : "Chưa có"}
                </div>
                <div>
                  <strong>Thời gian về :</strong>{" "}
                  {modalData.check_out_time
                    ? new Date(modalData.check_out_time).toLocaleTimeString(
                        "vi-VN"
                      )
                    : "Chưa có"}
                </div>
              </div>

              <div className="d-flex gap-3 justify-content-between">
                {modalData.img_checkin && (
                  <div style={{ flex: 1 }}>
                    <small>Ảnh checkin :</small>
                    <img
                      src={`${URL_WEB}${modalData.img_checkin}`}
                      alt="Ảnh checkin"
                      style={{
                        width: "100%",
                        maxHeight: 250,
                        objectFit: "cover",
                        border: "1px solid #ccc",
                        borderRadius: 5,
                      }}
                    />
                  </div>
                )}
                {modalData.img_checkout && (
                  <div style={{ flex: 1 }}>
                    <small>Ảnh checkout:</small>
                    <img
                      src={`${URL_WEB}${modalData.img_checkout}`}
                      alt="Ảnh checkout"
                      style={{
                        width: "100%",
                        maxHeight: 250,
                        objectFit: "cover",
                        border: "1px solid #ccc",
                        borderRadius: 5,
                      }}
                    />
                  </div>
                )}
              </div>

              <p className="mt-3">
                <strong>Trạng thái:</strong>{" "}
                {modalData.status === "late" ? "🕒 Đến muộn" : "✅ Đúng giờ"}
              </p>
            </>
          ) : (
            <p>Không có dữ liệu chấm công.</p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showForgotModal}
        onHide={() => {
          setShowForgotModal(false);
          setStep(1);
          setForgotEmail("");
          setOtp("");
          setNewForgotPassword("");
          setForgotMsg(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>🔑 Quên mật khẩu</Modal.Title>
        </Modal.Header>
        {step === 2 && (
          <p className="text-danger text-center">
            ⏳ OTP hết hạn sau: <strong>{formatTime(otpTimer)}</strong>
          </p>
        )}
        {otpTimer <= 0 ? (
          <Button
            variant="link"
            size="sm"
            onClick={async () => {
              try {
                const res = await fetch(
                  `${API_URL}/employees/forgot-password`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: forgotEmail }),
                  }
                );
                const data = await res.json();
                if (res.ok) {
                  setOtpTimer(600); // reset lại 10 phút
                  setForgotMsg({
                    type: "success",
                    text: "Gửi lại OTP thành công!",
                  });
                } else {
                  setForgotMsg({ type: "danger", text: data.message });
                }
              } catch {
                setForgotMsg({ type: "danger", text: "Lỗi gửi lại OTP." });
              }
            }}
          >
            🔁 Gửi lại OTP
          </Button>
        ) : null}
        {forgotMsg && (
          <div
            className={`mt-3 alert alert-${
              forgotMsg.type === "success" ? "success" : "danger"
            }`}
          >
            {forgotMsg.text}
          </div>
        )}
        <Modal.Body>
          {step === 1 ? (
            <>
              <label>Nhập email của bạn:</label>
              <input
                type="email"
                className="form-control"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </>
          ) : (
            <>
              <label>Mã OTP (đã gửi qua email):</label>
              <div className="otp-input-group">
                {Array.from({ length: 6 }).map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    className="otp-box"
                    value={otp[index] || ""}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    ref={(el) => (otpRefs.current[index] = el)}
                  />
                ))}
              </div>
              <label>Mật khẩu mới:</label>
              <input
                type="password"
                className="form-control"
                value={newForgotPassword}
                onChange={(e) => setNewForgotPassword(e.target.value)}
              />
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowForgotModal(false);
              setStep(1);
              setForgotEmail("");
              setOtp("");
              setNewForgotPassword("");
              setForgotMsg(null);
            }}
          >
            Đóng
          </Button>

          <Button
            variant="primary"
            disabled={isSubmitting} // khóa nút khi đang xử lý
            onClick={async () => {
              setIsSubmitting(true);
              try {
                if (step === 1) {
                  const res = await fetch(
                    `${API_URL}/employees/forgot-password`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: forgotEmail }),
                    }
                  );
                  const data = await res.json();
                  if (res.ok) {
                    setStep(2);
                    setOtpTimer(600);
                    setForgotMsg({ type: "success", text: data.message });
                  } else {
                    setForgotMsg({ type: "danger", text: data.message });
                  }
                } else {
                  const joinedOtp = otp.join("");
                  const res = await fetch(
                    `${API_URL}/employees/reset-password`,
                    {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        email: forgotEmail,
                        otp: joinedOtp,
                        newPassword: newForgotPassword,
                      }),
                    }
                  );
                  const data = await res.json();
                  if (res.ok) {
                    setForgotMsg({ type: "success", text: data.message });
                    setTimeout(() => {
                      setShowForgotModal(false);
                    }, 2000);
                  } else {
                    setForgotMsg({ type: "danger", text: data.message });
                  }
                }
              } catch (err) {
                setForgotMsg({ type: "danger", text: "Lỗi server." });
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Đang xử lý...
              </>
            ) : step === 1 ? (
              "Gửi OTP"
            ) : (
              "Xác nhận đổi mật khẩu"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminProfile;
