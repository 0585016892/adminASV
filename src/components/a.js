import React, { useState, useRef, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  markNotificationAsRead,
  fetchNotifications,
  markAllNotificationsAsRead,
} from "../api/chatApi";
import {
  FaBell,
  FaChevronDown,
  FaBoxOpen,
  FaUsers,
  FaMoneyBillWave,
  FaShoppingCart,
} from "react-icons/fa";
import "../assets/MainContainer.css";
import women from "../img/admin.jpg";
import {
  fetchStats,
  fetchRevenueDaily,
  fetchRecentOrders,
  getRevenueByCategory,
  getOrderStatusRatio,
  getRevenueByMonth
} from "../api/dashApi";
import { io } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Badge, Spinner } from "react-bootstrap";

const URL_WEB = process.env.REACT_APP_WEB_URL;
const socket = io(`${URL_WEB}`);

export default function Dashboard() {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA55DD"];

  const { user } = useAuth();
  const navigate = useNavigate();

  const notifRef = useRef(null);
  const menuRef = useRef(null);

  const [stats, setStats] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [revenueData, setRevenueData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [orderStatusData, setOrderStatusData] = useState([]);
  const [revenueMonthly, setRevenueMonthly] = useState([]);
  const [data, setData] = useState([]);
  useEffect(() => {
    Promise.all([fetchStats(), fetchRecentOrders()])
      .then(([statsRes, ordersRes]) => {
        setStats(statsRes);
        setRecentOrders(ordersRes);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  // ✅ Biểu đồ doanh thu
  useEffect(() => {
    fetchRevenueDaily(fromDate, toDate).then(setRevenueData);
  }, [fromDate, toDate]);
  // Dữ liệu cho biểu
useEffect(() => {
  (async () => {
    const [statusRes, monthlyRes, categoryRes] = await Promise.all([
      getOrderStatusRatio(),
      getRevenueByMonth(),
      getRevenueByCategory() // 🆕 thêm dòng này
    ]);

    setOrderStatusData(statusRes || []);
    setRevenueMonthly(monthlyRes || []);
    setData(categoryRes || []); // 🆕 lưu vào state data
  })();
}, []);

const pieData = (data || []).map((item) => ({
  category: item.category,
  total_revenue: Number(item.total_revenue)
}));

  // ✅ Lấy thông báo ban đầu
  useEffect(() => {
    if (!user?.id) return;
    fetchNotifications(user.id)
      .then((data) => {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      })
      .catch(console.error);
  }, [user]);

  // ✅ Socket: Nhận thông báo mới
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
 const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  // ✅ Đóng dropdown thông báo khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Đóng menu user khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Format tiền tệ
  const formattedValue = (value) => {
    const num = Number(value);
    if (isNaN(num)) return value;
    return Math.floor(num).toLocaleString("vi-VN") + " đ";
  };

  // ✅ Đánh dấu tất cả thông báo đã đọc
  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Lỗi khi đánh dấu tất cả đã đọc:", err);
    }
  };

  const getIconForStat = (label) => {
    if (label.includes("Doanh thu")) return <FaMoneyBillWave className="stat-icon text-success" />;
    if (label.includes("Đơn hàng")) return <FaShoppingCart className="stat-icon text-primary" />;
    if (label.includes("Sản phẩm")) return <FaBoxOpen className="stat-icon text-warning" />;
    if (label.includes("Khách hàng")) return <FaUsers className="stat-icon text-danger" />;
    return <FaBoxOpen className="stat-icon text-secondary" />;
  };

return (
  <div className="dashboard-container">
    {/* 🔹 Header */}
    <header className="dashboard-header">
      <h4 className="dashboard-title">Trung tâm quản lý bán hàng Âm Sắc Việt</h4>

      <div className="header-actions">
        {/* 🔔 Thông báo */}
        <div ref={notifRef} className="notification-wrapper">
          <button
            className="btn btn-light rounded-circle shadow-sm position-relative"
            onClick={() => setShowNotifications((prev) => !prev)}
          >
            <FaBell className="fs-5 text-primary" />
            {unreadCount > 0 && (
              <Badge bg="danger" className="notif-badge">
                {unreadCount}
              </Badge>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                className="notification-dropdown"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold text-primary">Thông báo</h6>
                  <Button variant="outline-primary" size="sm" onClick={handleMarkAllAsRead}>
                    Đọc tất cả
                  </Button>
                </div>
                <hr />
                {notifications.length === 0 ? (
                  <p className="text-center text-muted">Không có thông báo mới</p>
                ) : (
                  notifications.map((note) => (
                    <motion.div
                      key={note.id}
                      className={`notif-item ${note.is_read ? "read" : "unread"}`}
                      whileHover={{ scale: 1.03 }}
                      onClick={async () => {
                        if (!note.is_read) await markNotificationAsRead(note.id);
                        navigate(
                          note.type === "message" ? "/message/danh-sach" : "/don-hang/danh-sach"
                        );
                      }}
                    >
                      <div className="fw-semibold">{note.message}</div>
                      <small className="text-muted">
                        {new Date(note.created_at).toLocaleString("vi-VN")}
                      </small>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 👤 Avatar + User menu */}
        <div className="d-flex align-items-center gap-2" ref={menuRef}>
          <img
            src={user?.avatar ? `${URL_WEB}${user.avatar}` : women}
            alt="avatar"
            className="avatar1"
          />
          <div className="user-info" onClick={() => setOpen(!open)}>
            <strong>{user?.full_name}</strong>
            <FaChevronDown className={`ms-2 chevron-icon ${open ? "rotate" : ""}`} />
            {open && (
              <div className="menuContainer">
                <ul>
                  <li><a href="/trang-ca-nhan">Trang cá nhân</a></li>
                  <li><a onClick={handleLogout}>Đăng xuất</a></li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

    {/* 🔸 Nội dung chính */}
    {loading ? (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
      </div>
    ) : (
      <>
        {/* 1️⃣ Thống kê nhanh */}
        <div className="stats-grid">
          {stats.map(({ label, number, helpText }, i) => (
            <motion.div
              key={i}
              className="stat-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="stat-icon-container">{getIconForStat(label)}</div>
              <div>
                <div className="fw-bold text-secondary">{label}</div>
                <div className="fs-4 fw-bold mt-2 text-dark">
                  {label.includes("Doanh thu") ? formattedValue(number) : number}
                </div>
                <small className="text-muted">{helpText}</small>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 2️⃣ Biểu đồ doanh thu chính */}
        <div className="chart-card shadow-sm">
          <div className="chart-header d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-primary mb-0">Biểu đồ doanh thu theo ngày</h5>

            <div className="date-filter d-flex align-items-center gap-2">
              <div className="d-flex flex-column">
                <label className="form-label small text-muted mb-1">Từ ngày</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="d-flex flex-column">
                <label className="form-label small text-muted mb-1">Đến ngày</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formattedValue} />
              <Tooltip
                formatter={(value) => formattedValue(value)}
                labelFormatter={(label) => `Ngày: ${label}`}
              />
              <Bar dataKey="revenue" fill="#4e73df" radius={[6, 6, 0, 0]} name="Tổng doanh thu">
                <LabelList
                  dataKey="revenue"
                  position="top"
                  formatter={formattedValue}
                  style={{ fontSize: 10, fill: "#333" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 3️⃣ Biểu đồ mở rộng (3 cái chung 1 hàng) */}
        <div className="row mt-4">
          {/* Trạng thái đơn hàng */}
          <div className="col-md-4">
              <div className="chart-card shadow-sm">
                <h6 className="fw-bold text-primary mb-3">Tỷ lệ trạng thái đơn hàng</h6>
                {orderStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F"][
                                index % 5
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted small">Chưa có dữ liệu trạng thái đơn hàng</p>
                )}
              </div>
            </div>


          {/* Doanh thu theo tháng */}
          <div className="col-md-4">
            <div className="chart-card shadow-sm">
              <h6 className="fw-bold text-primary mb-3">Doanh thu theo tháng</h6>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                 data={revenueMonthly}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formattedValue} />
                  <Tooltip formatter={formattedValue} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ff7300"
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Doanh thu theo danh mục */}
          <div className="col-md-4">
            <div className="chart-card shadow-sm">
              <h6 className="fw-bold text-primary mb-3">Doanh thu theo danh mục</h6>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pieData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis tickFormatter={formattedValue} />
                  <Tooltip formatter={formattedValue} />
                  <Legend />
                  <Bar dataKey="total_revenue" fill="#82ca9d" name="Tổng doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 4️⃣ Đơn hàng mới nhất */}
        <div className="orders-card mt-4">
          <h5 className="fw-bold text-primary mb-3">Đơn hàng mới nhất</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(({ id, customer, total, status, date }) => (
                  <tr key={id}>
                    <td>DH0{id}</td>
                    <td>{customer}</td>
                    <td>{formattedValue(total)}</td>
                    <td>
                      <span
                        className={`badge ${
                          status === "Đã giao"
                            ? "bg-success"
                            : status === "Đang giao"
                            ? "bg-info"
                            : status === "Đã hủy"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td>{date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )}
  </div>
);

}
