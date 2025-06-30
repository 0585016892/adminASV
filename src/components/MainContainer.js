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
const URL_WEB = process.env.REACT_APP_WEB_URL; // Cập nhật URL nếu khác

const socket = io(`${URL_WEB}`);

// Hàm format tiền
function formatCurrency(value) {
  if (typeof value === "number") {
    return value.toLocaleString("vi-VN") + " đ";
  }
  return value;
}

export default function Dashboard() {
  const [stats, setStats] = useState([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [revenueData, setRevenueData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [recentOrders, setRecentOrders] = useState([]);

  const notifRef = useRef(null);
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  useEffect(() => {
    fetchStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);
  useEffect(() => {
    // Gọi API khi fromDate hoặc toDate thay đổi, hoặc lần đầu
    fetchRevenueDaily(fromDate, toDate).then(setRevenueData);
  }, [fromDate, toDate]);

  // Đóng popup khi click ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    fetchRecentOrders().then(setRecentOrders);
  }, []);

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

  useEffect(() => {
    // Lắng nghe sự kiện 'newOrderNotification' từ server
    socket.on("newOrderNotification", (data) => {
      setNotifications((prev) => [data, ...prev]); // Thêm thông báo mới lên đầu mảng
      setShowNotifications(true); // Tự động hiện popup khi có thông báo mới
    });

    return () => {
      socket.off("newOrderNotification");
    };
  }, []);

  const formattedValue = (value) => {
    // Chuyển số thành chuỗi định dạng tiền Việt Nam, không hiện phần thập phân nếu bằng 0
    const number = Number(value);
    return number.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0, // Không hiển thị số thập phân
      maximumFractionDigits: 0,
    });
  };
  function formatCurrency(value) {
    const num = Number(value);
    if (isNaN(num)) return value;
    // Chuyển về số nguyên bằng Math.floor để bỏ phần .00
    const rounded = Math.floor(num);
    return rounded.toLocaleString("vi-VN") + " đ";
  }
  //search
  const [searchTerm, setSearchTerm] = useState("");

  <input
    type="text"
    placeholder="Search items, collections"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />;

  return (
    <>
      <div className="topContainer">
        <div className="dashboard-title">
          <h2>Trung tâm quản lý bán hàng Finly</h2>
        </div>

        <div className="profileContainer">
          <div className="position-relative" ref={notifRef}>
            <button
              className="profileIcon"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell />
            </button>
            {showNotifications && (
              <div className="notif-popup">
                {notifications.length === 0 ? (
                  <p>Không có thông báo mới</p>
                ) : (
                  notifications.map((note, i) => (
                    <div className="notification-item" key={i}>
                      {note.message}
                    </div>
                  ))
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
          <i
            className="menuChevron"
            style={{ color: "black" }}
            id="menuChevron"
          >
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
      <div className="mt-4">
        {/* Thống kê nhanh */}
        <div className="stats-grid">
          {stats.map(({ label, number, helpText }) => (
            <div className="stat-card" key={label}>
              <div className="stat-label">{label}</div>
              <div className="stat-number">
                {label == "Doanh thu hôm nay" ? formatCurrency(number) : number}
              </div>
              <div className="stat-help">{helpText}</div>
            </div>
          ))}
        </div>

        <>
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
            <div
              className="chart-container"
              style={{ fontSize: "12px", fontFamily: "Arial, sans-serif" }}
            >
              <div
                className="section-title"
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Biểu đồ doanh thu theo ngày
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={revenueData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis
                    tickFormatter={(value) => formattedValue(value)}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    formatter={(value) => formattedValue(value)}
                    labelFormatter={(label) => `Ngày: ${label}`}
                  />
                  <Bar dataKey="revenue" fill="#3182ce">
                    <LabelList
                      dataKey="revenue"
                      position="top"
                      formatter={(value) => formattedValue(value)}
                      style={{ fontSize: 10, fill: "#333" }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>

        {/* Bảng đơn hàng mới nhất */}
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
                  <td>{formatCurrency(total)}</td>
                  <td>{status}</td>
                  <td>{date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
