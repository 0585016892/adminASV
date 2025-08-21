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
import { markMessagesAsRead, fetchNotifications ,markNotificationAsRead } from "../api/chatApi";
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

            {showNotifications && (
              <div className="notif-popup">
                {notifications.length === 0 ? (
                  <p>Không có thông báo mới</p>
                ) : (
                  notifications.map((note, i) => {
                    const isRead = note.is_read || readMessages[note.id];
                    return (
                      <div
                        key={i}
                        className="notification-item"
                        onClick={() => handleClickNotification(note)}
                        style={{
                          cursor: "pointer",
                          padding: "10px 14px",
                          backgroundColor: isRead ? "#f7f7f7" : "#fff",
                          color: isRead ? "#999" : "#000",
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        {note.message}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
          <div className="profileImage">
            <img src={women} alt="" />
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
