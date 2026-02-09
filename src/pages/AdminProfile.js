import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Row, Col, Card, Avatar, Tag, Button, List, Typography, 
  Badge, Calendar, Modal, Image, Alert, Space, Input, 
  Statistic, Progress, Spin, Divider, Result
} from "antd";
import { 
  MailOutlined, PhoneOutlined, SafetyCertificateOutlined, 
  LockOutlined, CheckCircleOutlined, ClockCircleOutlined,
  CalendarOutlined, UserOutlined, CameraOutlined,
  ArrowRightOutlined, SyncOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useAuth } from "../contexts/AuthContext";
import { getAttendanceByDate, checkIn, checkOut } from "../api/adminproApi";
import io from "socket.io-client";
import logo from "../img/admin.jpg";

dayjs.locale("vi");
const { Title, Text, Paragraph } = Typography;
const URL_WEB = process.env.REACT_APP_WEB_URL;
const API_URL = process.env.REACT_APP_API_URL;
const socket = io(`${URL_WEB}`);

const AdminProfile = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [markedDates, setMarkedDates] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal Chi tiết & Quên mật khẩu
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  
  // Logic OTP
  const [step, setStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const otpRefs = useRef([]);

  // 1. Socket & Realtime
  useEffect(() => {
    if (user?.id) {
      socket.emit("join-user-room", user.id);
      return () => {
        socket.off("attendance-realtime");
        socket.disconnect();
      };
    }
  }, [user]);

  // 2. Lấy dữ liệu chấm công hàng tháng
  const fetchMonthAttendance = useCallback(async (date) => {
    if (!user) return;
    setLoading(true);
    const startOfMonth = date.startOf('month');
    const daysInMonth = date.daysInMonth();
    const dates = [];

    // Tối ưu: Trong thực tế nên có API lấy cả tháng thay vì loop từng ngày
    for (let i = 0; i < daysInMonth; i++) {
      const current = startOfMonth.add(i, 'day').format('YYYY-MM-DD');
      try {
        const res = await getAttendanceByDate(user.id, current);
        if (res.success && res.data.length > 0) {
          dates.push({ 
            date: current, 
            status: res.data[0].check_out_time ? "checkout" : "checkin" 
          });
        }
      } catch {}
    }
    setMarkedDates(dates);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMonthAttendance(selectedDate);
  }, [fetchMonthAttendance]);

  // 3. Xử lý Lịch
  const dateCellRender = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    const mark = markedDates.find((d) => d.date === dateStr);
    if (!mark) return null;

    return (
      <div className="attendance-dot">
        <Badge status={mark.status === "checkout" ? "success" : "processing"} 
               text={mark.status === "checkout" ? "Xong" : "Vào"} />
      </div>
    );
  };

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    const formatted = date.format("YYYY-MM-DD");
    try {
      const res = await getAttendanceByDate(user.id, formatted);
      setModalData(res.success && res.data.length > 0 ? res.data[0] : null);
      setShowModal(true);
    } catch {
      setModalData(null);
    }
  };

  // 4. Logic Đổi mật khẩu & OTP
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleSendOTP = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/employees/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail || user.email }),
      });
      if (res.ok) {
        setStep(2);
        setOtpTimer(600);
      }
    } finally { setIsSubmitting(false); }
  };

  if (!user) return <div className="p-5 text-center"><Spin size="large" /></div>;

  return (
    <div className="admin-profile-container" style={{ padding: '24px', background: '#f0f2f5' }}>
      <Row gutter={[24, 24]}>
        {/* Cột trái: Profile Card */}
        <Col xs={24} lg={8}>
          <Card className="profile-main-card shadow-sm" borderless style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(45deg, #1890ff, #722ed1)', height: '100px' }} />
            <div style={{ textAlign: 'center', marginTop: '-50px' }}>
              <Avatar 
                size={110} 
                src={user.avatar ? `${URL_WEB}${user.avatar}` : logo} 
                icon={<UserOutlined />}
                style={{ border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Title level={3} style={{ marginTop: 12, marginBottom: 0 }}>{user.full_name}</Title>
              <Tag color="blue" icon={<SafetyCertificateOutlined />} style={{ marginTop: 8 }}>{user.role}</Tag>
            </div>

            <Divider orientation="left">Thông tin</Divider>
            <List size="small">
              <List.Item><Text type="secondary"><MailOutlined className="me-2"/> Email:</Text> <Text strong>{user.email}</Text></List.Item>
              <List.Item><Text type="secondary"><PhoneOutlined className="me-2"/> SĐT:</Text> <Text strong>{user.phone}</Text></List.Item>
              <List.Item><Text type="secondary"><ClockCircleOutlined className="me-2"/> Bộ phận:</Text> <Tag>{user.department}</Tag></List.Item>
              <List.Item>
                <Text type="secondary">Trạng thái:</Text> 
                <Badge status={user.status === "active" ? "success" : "error"} text={user.status === "active" ? "Hoạt động" : "Khóa"} />
              </List.Item>
            </List>

            <Button 
              block 
              type="primary" 
              ghost 
              icon={<LockOutlined />} 
              style={{ marginTop: 16 }}
              onClick={() => {
                setForgotEmail(user.email);
                setShowForgotModal(true);
              }}
            >
              Cập nhật bảo mật
            </Button>
          </Card>
        </Col>

        {/* Cột phải: Lịch Chấm Công */}
        <Col xs={24} lg={16}>
          <Card 
            title={<Space><CalendarOutlined /> Lịch trình làm việc</Space>}
            className="shadow-sm"
            style={{ borderRadius: '16px' }}
            extra={<Text type="secondary">Dữ liệu thời gian thực</Text>}
          >
            <div className="attendance-calendar-wrapper">
              <Calendar 
                fullscreen={false} 
                onSelect={handleDateSelect}
                cellRender={dateCellRender}
                onPanelChange={(date) => fetchMonthAttendance(date)}
              />
            </div>
            
            <Divider />
            <Row gutter={16} textAlign="center">
              <Col span={8}>
                <Statistic title="Đúng giờ" value={95} suffix="%" valueStyle={{ color: '#3f8600' }} />
              </Col>
              <Col span={8}>
                <Statistic title="Ngày công" value={markedDates.length} suffix="/ 26" />
              </Col>
              <Col span={8}>
                <Statistic title="Đi muộn" value={2} valueStyle={{ color: '#cf1322' }} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Modal Chi tiết ngày */}
      <Modal
        title={`Chi tiết ngày ${selectedDate.format('DD/MM/YYYY')}`}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={[<Button key="close" onClick={() => setShowModal(false)}>Đóng</Button>]}
      >
        {modalData ? (
          <div style={{ padding: '10px 0' }}>
            <Row gutter={16} className="mb-4">
              <Col span={12}>
                <Card size="small" title="Giờ vào" headStyle={{ background: '#e6f7ff' }}>
                  <Title level={4} style={{ margin: 0 }}>{modalData.check_in_time ? dayjs(modalData.check_in_time).format('HH:mm:ss') : '--:--'}</Title>
                  {modalData.img_checkin && <Image src={`${URL_WEB}${modalData.img_checkin}`} className="mt-2 rounded" />}
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Giờ ra" headStyle={{ background: '#f6ffed' }}>
                  <Title level={4} style={{ margin: 0 }}>{modalData.check_out_time ? dayjs(modalData.check_out_time).format('HH:mm:ss') : '--:--'}</Title>
                  {modalData.img_checkout && <Image src={`${URL_WEB}${modalData.img_checkout}`} className="mt-2 rounded" />}
                </Card>
              </Col>
            </Row>
            <Alert 
              message={modalData.status === 'late' ? "Ghi nhận: Đến muộn" : "Ghi nhận: Đúng giờ"}
              type={modalData.status === 'late' ? "warning" : "success"}
              showIcon
              icon={modalData.status === 'late' ? <ClockCircleOutlined /> : <CheckCircleOutlined />}
            />
          </div>
        ) : (
          <Result status="404" title="Không có dữ liệu chấm công" subTitle="Bạn chưa thực hiện check-in vào ngày này." />
        )}
      </Modal>

      {/* Modal OTP / Quên mật khẩu */}
      <Modal
        title="🔑 Thiết lập bảo mật mới"
        open={showForgotModal}
        footer={null}
        onCancel={() => setShowForgotModal(false)}
        destroyOnClose
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          {step === 1 ? (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Paragraph>Hệ thống sẽ gửi mã OTP gồm 6 chữ số đến email: <b>{user.email}</b></Paragraph>
              <Button type="primary" size="large" icon={<SyncOutlined />} loading={isSubmitting} onClick={handleSendOTP} block>
                Gửi mã xác thực
              </Button>
            </Space>
          ) : (
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Statistic.Countdown title="Mã OTP hết hạn sau" value={Date.now() + otpTimer * 1000} onFinish={() => setOtpTimer(0)} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {otp.map((digit, idx) => (
                  <Input 
                    key={idx}
                    ref={el => otpRefs.current[idx] = el}
                    style={{ width: 45, textAlign: 'center', fontSize: 20 }}
                    maxLength={1}
                    value={digit}
                    onChange={e => {
                      const val = e.target.value;
                      if (!/^\d*$/.test(val)) return;
                      const newOtp = [...otp];
                      newOtp[idx] = val;
                      setOtp(newOtp);
                      if (val && idx < 5) otpRefs.current[idx+1].focus();
                    }}
                  />
                ))}
              </div>
              <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" size="large" onChange={e => setNewPassword(e.target.value)} />
              <Button type="primary" size="large" block loading={isSubmitting}>
                Xác nhận thay đổi
              </Button>
              {otpTimer === 0 && <Button type="link" onClick={handleSendOTP}>Gửi lại mã</Button>}
            </Space>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AdminProfile;