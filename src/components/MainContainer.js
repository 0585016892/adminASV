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
import { markMessagesAsRead, fetchNotifications ,markNotificationAsRead ,markAllNotificationsAsRead} from "../api/chatApi";
import { BiSearchAlt } from "react-icons/bi";
import { FaBell, FaChevronDown } from "react-icons/fa";
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
import { Button, Badge } from "react-bootstrap";

const URL_WEB = process.env.REACT_APP_WEB_URL; 
const socket = io(`${URL_WEB}`);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const notifRef = useRef(null);

  // Dashboard states
  const [stats, setStats] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [revenueData, setRevenueData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [readMessages, setReadMessages] = useState({}); // tạm thời lưu trạng thái đọc

  // Fetch dashboard stats
  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(console.error);
    fetchRecentOrders().then(setRecentOrders);
  }, []);

  useEffect(() => {
    fetchRevenueDaily(fromDate, toDate).then(setRevenueData);
  }, [fromDate, toDate]);

  // Fetch notifications khi load trang
  useEffect(() => {
    if (!user?.id) return;
    fetchNotifications(user.id)
      .then((data) => {
        setNotifications(data);
        const unread = data.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
      })
      .catch(console.error);
  }, [user]);

  // Socket.io events
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

  // Close notifications popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

 const handleClickNotification = async (note) => {
  try {
    if (!note.is_read) {
      await markNotificationAsRead(note.id);
      setReadMessages((prev) => ({ ...prev, [note.id]: true }));
    }

    if (note.type === "message" && note.sender) {
      navigate("/message/danh-sach");
    } else if (note.type === "order") {
      navigate("/don-hang/danh-sach");
    }
  } catch (err) {
    console.error("Lỗi khi đánh dấu thông báo đã đọc:", err);
  }
};
const handleMarkAllAsRead = async () => {
  if (!user?.id) return;

  try {
    const res = await markAllNotificationsAsRead(user.id);
    if (res.success) {
      // cập nhật local state notifications
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: 1 }))
      );
      setUnreadCount(0);
    }
  } catch (err) {
    console.error("Lỗi khi đánh dấu tất cả đã đọc:", err);
  }
};

  const formattedValue = (value) => {
    const num = Number(value);
    if (isNaN(num)) return value;
    return Math.floor(num).toLocaleString("vi-VN") + " đ";
  };
  useEffect(() => {
    const mouseTarget = document.getElementById("menuChevron");
    const menuContainer = document.getElementById("menuContainer");
    mouseTarget.addEventListener("mouseenter", () => {
      mouseTarget.style.transform = "rotate(180deg)";
      menuContainer.style.transform = "translateX(0px)";
    });

    menuContainer.addEventListener("mouseleave", () => {
      mouseTarget.style.transform = "rotate(0deg)";
      menuContainer.style.transform = "translateX(300px)";
    });
  }, []);
  return (
    <>
      {/* Top header */}
      <div className="topContainer">
        <div className="dashboard-title">
          <h2>Trung tâm quản lý bán hàng Âm Sắc Việt</h2>
        </div>
        <div className="profileContainer">
          {/* Notification Popup */}
          <div className="position-relative" ref={notifRef}>
            <button
              className="profileIcon"
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) setUnreadCount(0);
              }}
            >
              <FaBell />
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount}</span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  className="notif-popup shadow-lg rounded-3 p-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    position: "absolute",
                    top: "60px",
                    right: "10px",
                    width: "350px",
                    maxHeight: "450px",
                    overflowY: "auto",
                    background: "#ffffff",
                    zIndex: 9999,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  }}
                >
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-center mb-2 px-2">
                    <h6 className="mb-0">Thông báo</h6>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={handleMarkAllAsRead}
                    >
                      Đã đọc tất cả
                    </Button>
                  </div>

                  <hr className="my-1" />

                  {/* Notifications list */}
                  {notifications.length === 0 ? (
                    <p className="text-center text-muted my-3">Không có thông báo mới</p>
                  ) : (
                    notifications.map((note) => {
                      const isRead = note.is_read || readMessages[note.id];
                      return (
                        <motion.div
                          key={note.id}
                          className="notification-item d-flex align-items-start p-2 mb-2 rounded"
                          whileHover={{ scale: 1.02, backgroundColor: isRead ? "#f1f1f1" : "#e6f0ff" }}
                          style={{
                            cursor: "pointer",
                            backgroundColor: isRead ? "#f7f7f7" : "#dceeff",
                            color: isRead ? "#666" : "#000",
                            borderLeft: isRead ? "4px solid transparent" : "4px solid #007bff",
                            transition: "all 0.2s",
                          }}
                          onClick={async () => {
                            if (!isRead) {
                              try {
                                await markNotificationAsRead(note.id);
                                setReadMessages((prev) => ({ ...prev, [note.id]: true }));
                              } catch (err) {
                                console.error("Lỗi khi đánh dấu thông báo đã đọc:", err);
                              }
                            }

                            if (note.type === "message" && note.sender) {
                              navigate("/message/danh-sach");
                            } else if (note.type === "order") {
                              navigate("/don-hang/danh-sach");
                            }
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div className="d-flex justify-content-between align-items-start">
                              <p className="mb-1">{note.message}</p>
                              {!isRead && <Badge bg="primary" pill>New</Badge>}
                            </div>
                            <small className="text-muted">
                              {new Date(note.created_at).toLocaleString("vi-VN")}
                            </small>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="profileImage">
            <img
                           src={
                             user && user.avatar
                               ? `${URL_WEB}${user.avatar}`
                               : women
                           }
                           alt="avatar"
                           className="rounded-circle border"
                         />
          </div>
          <p style={{ color: "black" }} className="profileName">
            {user?.full_name}
          </p>
          <i className="menuChevron" style={{ color: "black" }} id="menuChevron" >
            <FaChevronDown />
          </i>
          <div className="menuContainer" id="menuContainer">
            <ul>
              <li>
                <a href="/trang-ca-nhan">Trang cá nhân</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dashboard stats */}
      <div className="mt-4 stats-grid">
        {stats.map(({ label, number, helpText }) => (
          <div className="stat-card" key={label}>
            <div className="stat-label">{label}</div>
            <div className="stat-number">
              {label === "Doanh thu hôm nay" ? formattedValue(number) : number}
            </div>
            <div className="stat-help">{helpText}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="date-inputs">
        <label>
          Từ ngày:{" "}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="date-picker"
          />
        </label>
        <label>
          Đến ngày:{" "}
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="date-picker"
          />
        </label>
      </div>
      <div className="main-row">
        <div className="chart-container">
          <div className="section-title">Biểu đồ doanh thu theo ngày</div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={revenueData}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={formattedValue} tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value) => formattedValue(value)}
                labelFormatter={(label) => `Ngày: ${label}`}
              />
              <Bar dataKey="revenue" fill="#3182ce">
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

      {/* Recent orders table */}
      <div className="table-container">
        <div className="section-title">Đơn hàng mới nhất</div>
        <table>
          <thead>
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
                <td>#{id}</td>
                <td>{customer}</td>
                <td>{formattedValue(total)}</td>
                <td>{status}</td>
                <td>{date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
