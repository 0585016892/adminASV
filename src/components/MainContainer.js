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
} from "../api/dashApi";
import { io } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Badge, Spinner } from "react-bootstrap";

const URL_WEB = process.env.REACT_APP_WEB_URL;
const socket = io(`${URL_WEB}`);

export default function Dashboard() {
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

  // ✅ Load dữ liệu thống kê và đơn hàng
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
      {/* Header */}
      <header className="dashboard-header">
        <h4 className="dashboard-title">Trung tâm quản lý bán hàng Âm Sắc Việt</h4>

        <div className="header-actions">
          {/* Thông báo */}
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

          {/* Avatar + User menu */}
          <div className="d-flex align-items-center gap-2" ref={menuRef}>
            <img
              src={user?.avatar ? `${URL_WEB}${user.avatar}` : women}
              alt="avatar"
              className="avatar1"
            />

            <div className="user-info" onClick={() => setOpen(!open)}>
              <strong>{user?.full_name}</strong>
              <FaChevronDown
                className={`ms-2 chevron-icon ${open ? "rotate" : ""}`}
              />
              {open && (
                <div className="menuContainer">
                  <ul>
                    <li><a href="/trang-ca-nhan">Trang cá nhân</a></li>
                    <li><a href="/doi-mat-khau">Đổi mật khẩu</a></li>
                    <li><a href="/dang-xuat">Đăng xuất</a></li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Nội dung */}
      {loading ? (
        <div className="loading-container">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          {/* Thống kê nhanh */}
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

          {/* Biểu đồ */}
          <div className="chart-card shadow-sm">
            <div className="chart-header d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-primary mb-0">
                Biểu đồ doanh thu theo ngày
              </h5>

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

            <div className="chart-body">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={formattedValue} />
                  <Tooltip
                    formatter={(value) => formattedValue(value)}
                    labelFormatter={(label) => `Ngày: ${label}`}
                  />
                  <Bar dataKey="revenue" fill="#4e73df" radius={[6, 6, 0, 0]}>
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
          </div>


          {/* Đơn hàng mới */}
          <div className="orders-card">
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
