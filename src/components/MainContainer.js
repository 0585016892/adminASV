import React, { useState, useRef, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import {
  markNotificationAsRead, fetchNotifications, markAllNotificationsAsRead,
} from "../api/chatApi";
import { 
  BellOutlined, ShoppingCartOutlined, TeamOutlined, 
  WalletOutlined, AppstoreOutlined, DownOutlined,
  LogoutOutlined, UserOutlined, SettingOutlined, HistoryOutlined
} from "@ant-design/icons";
import { 
  ConfigProvider, Card, Row, Col, Badge, Button, 
  Popover, Avatar, Spin, Table, Tag, DatePicker, Typography, Space 
} from "antd";
import "../assets/MainContainer.css";
import women from "../img/admin.jpg";
import {
  fetchStats, fetchRevenueDaily, fetchRecentOrders,
  getRevenueByCategory, getOrderStatusRatio, getRevenueByMonth,
} from "../api/dashApi";
import { io } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const { Title, Text } = Typography;
const URL_WEB = process.env.REACT_APP_WEB_URL;
const socket = io(`${URL_WEB}`);

export default function Dashboard() {
  // GIỮ NGUYÊN CẤU TRÚC LOGIC & STATE
  const COLORS = ["#5D4037", "#C19A6B", "#8D6E63", "#A89485", "#DCD7CC"];
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [revenueData, setRevenueData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [revenueMonthly, setRevenueMonthly] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Gộp tất cả API load 1 lần (Giữ nguyên logic của bạn)
  useEffect(() => {
    const fetchAllData = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const [statsRes, ordersRes, revenueDailyRes, orderStatusRes, revenueMonthlyRes, categoryRes, notificationsRes] = await Promise.all([
          fetchStats(), fetchRecentOrders(), fetchRevenueDaily(fromDate, toDate),
          getOrderStatusRatio(), getRevenueByMonth(), getRevenueByCategory(), fetchNotifications(user.id),
        ]);
        setStats(statsRes || []);
        setRecentOrders(ordersRes || []);
        setRevenueData(revenueDailyRes || []);
        setOrderStatusData(orderStatusRes || []);
        setRevenueMonthly(revenueMonthlyRes || []);
        setRevenueByCategory(categoryRes || []);
        setNotifications(notificationsRes || []);
        setUnreadCount((notificationsRes || []).filter((n) => !n.is_read).length);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchAllData();
  }, [user, fromDate, toDate]);

  // Socket (Giữ nguyên logic của bạn)
  useEffect(() => {
    socket.on("newOrderNotification", (data) => {
      const notif = { ...data, type: "order", is_read: 0 };
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((n) => n + 1);
    });
    socket.on("newMessageNotification", (data) => {
      const notif = { ...data, type: "message", is_read: 0 };
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((n) => n + 1);
    });
    return () => {
      socket.off("newOrderNotification");
      socket.off("newMessageNotification");
    };
  }, []);

  const formattedValue = (value) => {
    const num = Number(value);
    if (isNaN(num)) return value;
    return Math.floor(num).toLocaleString("vi-VN") + " đ";
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getIconForStat = (label) => {
    const style = { fontSize: 24, color: '#c19a6b' };
    if (label.includes("Doanh thu")) return <WalletOutlined style={style} />;
    if (label.includes("Đơn hàng")) return <ShoppingCartOutlined style={style} />;
    if (label.includes("Sản phẩm")) return <AppstoreOutlined style={style} />;
    if (label.includes("Khách hàng")) return <TeamOutlined style={style} />;
    return <AppstoreOutlined style={style} />;
  };

  // Cấu hình Header Actions (Notification + User Menu)
  const notificationContent = (
    <div style={{ width: 300 }}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <Text strong>Thông báo</Text>
        <Button type="link" size="small" onClick={handleMarkAllAsRead}>Đọc tất cả</Button>
      </div>
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div className="text-center py-3 text-muted">Không có thông báo mới</div>
        ) : (
          notifications.map((note) => (
            <div 
              key={note.id} 
              className={`p-2 border-bottom pointer ${!note.is_read ? 'bg-light' : ''}`}
              onClick={async () => {
                if (!note.is_read) await markNotificationAsRead(note.id);
                navigate(note.type === "message" ? "/message/danh-sach" : "/don-hang/danh-sach");
              }}
              style={{ cursor: 'pointer', borderRadius: 8 }}
            >
              <div style={{ fontSize: 13, fontWeight: note.is_read ? 400 : 600 }}>{note.message}</div>
              <small className="text-muted">{new Date(note.created_at).toLocaleString("vi-VN")}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const userMenuContent = (
    <div style={{ width: 180 }}>
      <Button type="text" block icon={<UserOutlined />} className="text-start" onClick={() => navigate("/trang-ca-nhan")}>Trang cá nhân</Button>
      <Button type="text" block icon={<SettingOutlined />} className="text-start" onClick={() => navigate("/settings")}>Cài đặt</Button>
      <Button type="text" block icon={<HistoryOutlined />} className="text-start" onClick={() => navigate("/systems_log")}>Log / Audit</Button>
      <hr className="my-1" />
      <Button type="text" danger block icon={<LogoutOutlined />} className="text-start" onClick={handleLogout}>Đăng xuất</Button>
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#5D4037",
          borderRadius: 16,
          fontFamily: "'Inter', sans-serif",
        },
      }}
    >
      <div className="dashboard-wrapper p-4 bg-light min-vh-100">
        <style>{`
          .title-font { font-family: 'Playfair Display', serif; }
          .stat-card { transition: all 0.3s ease; border: 1px solid #f1ece1; }
          .stat-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(93,64,55,0.05); }
          .glass-header { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); }
        `}</style>

        {/* Header - GIỮ NGUYÊN VỊ TRÍ NHƯNG ĐỔI COMPONENT */}
        <header className="glass-header shadow-sm rounded-4 p-3 mb-4 d-flex justify-content-between align-items-center border">
          <Title level={4} className="title-font m-0">Trung tâm quản lý Âm Sắc Việt</Title>
          
          <Space size={20}>
            <Popover placement="bottomRight" content={notificationContent} trigger="click">
              <Badge count={unreadCount} size="small">
                <Button shape="circle" icon={<BellOutlined style={{fontSize: 18}} />} />
              </Badge>
            </Popover>

            <Popover placement="bottomRight" content={userMenuContent} trigger="click">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar 
                  src={user?.avatar ? `${URL_WEB}${user.avatar}` : women} 
                  size="large" 
                  className="border"
                />
                <div className="d-none d-md-block">
                  <div style={{ fontWeight: 600, lineHeight: '1.2' }}>{user?.full_name}</div>
                  <small className="text-muted text-uppercase">{user?.role}</small>
                </div>
                <DownOutlined style={{ fontSize: 10 }} />
              </Space>
            </Popover>
          </Space>
        </header>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5"><Spin size="large" tip="Giai điệu đang được tải..." /></div>
        ) : (
          <>
            {/* Stats - GIỮ NGUYÊN DATA MAP */}
            <Row gutter={[20, 20]} className="mb-4">
              {stats.map(({ label, number, helpText }, i) => (
                <Col xs={24} sm={12} lg={6} key={i}>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className="stat-card" bordered={false}>
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-3 rounded-4" style={{ background: '#fdf8f0' }}>{getIconForStat(label)}</div>
                        <div>
                          <Text type="secondary" size="small" strong>{label}</Text>
                          <div className="fs-4 fw-bold text-dark">
                            {label.includes("Doanh thu") ? formattedValue(number) : number}
                          </div>
                          <Text type="success" style={{ fontSize: 12 }}>{helpText}</Text>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>

            {/* Biểu đồ chính */}
            <Card className="rounded-4 border mb-4 shadow-sm" bordered={false}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <Title level={5} className="title-font">Doanh thu theo ngày</Title>
                <Space>
                  <DatePicker.RangePicker 
                    onChange={(dates, dateStrings) => {
                      setFromDate(dateStrings[0]);
                      setToDate(dateStrings[1]);
                    }}
                  />
                </Space>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1ece1" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={formattedValue} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: '#fdfcf8'}} />
                  <Bar dataKey="revenue" fill="#c19a6b" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Biểu đồ nhỏ */}
            <Row gutter={[20, 20]}>
              <Col xs={24} lg={8}>
                <Card title={<span className="title-font">Tỷ lệ đơn hàng</span>} className="rounded-4 shadow-sm h-100">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={orderStatusData} dataKey="value" nameKey="name" outerRadius={80} innerRadius={60}>
                        {orderStatusData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title={<span className="title-font">Doanh thu tháng</span>} className="rounded-4 shadow-sm h-100">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={revenueMonthly}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1ece1" />
                      <XAxis dataKey="month" axisLine={false} />
                      <YAxis hide />
                      <RechartsTooltip formatter={formattedValue} />
                      <Line type="monotone" dataKey="revenue" stroke="#5D4037" strokeWidth={3} dot={{ r: 4, fill: '#c19a6b' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title={<span className="title-font">Cửa hàng vs Website</span>} className="rounded-4 shadow-sm h-100">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={revenueByCategory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="category" axisLine={false} />
                      <YAxis hide />
                      <RechartsTooltip formatter={formattedValue} />
                      <Bar dataKey="online" fill="#C19A6B" name="Offline" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="offline" fill="#DCD7CC" name="Online" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>

            {/* Đơn hàng mới nhất - Dùng Antd Table */}
            <Card title={<span className="title-font">Đơn hàng mới nhất</span>} className="rounded-4 shadow-sm mt-4 border" bordered={false}>
              <Table 
                dataSource={recentOrders} 
                rowKey="id"
                pagination={{ pageSize: 5 }}
                columns={[
                  { title: 'MÃ ĐƠN', dataIndex: 'id', render: (id) => <b>#DH0{id}</b> },
                  { title: 'KHÁCH HÀNG', dataIndex: 'customer' },
                  { title: 'TỔNG TIỀN', dataIndex: 'total', render: (val) => formattedValue(val) },
                  { title: 'TRẠNG THÁI', dataIndex: 'status', render: (status) => {
                    let color = status === "Đã giao" ? "success" : status === "Đang giao" ? "processing" : status === "Đã hủy" ? "error" : "warning";
                    return <Tag color={color} style={{ borderRadius: 6 }}>{status.toUpperCase()}</Tag>;
                  }},
                  { title: 'NGÀY ĐẶT', dataIndex: 'date' },
                ]}
              />
            </Card>
          </>
        )}
      </div>
    </ConfigProvider>
  );
}