import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../img/logo.png";
import {
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import "../assets/Menu.css";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
const Menu = () => {
  const location = useLocation();
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate(); // hook chuyển trang
  const { user } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSubMenu = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  const menu = [
    {
      text: "Bán hàng tại quầy",
      roles: ["admin", "staff"],
      children: [
        { path: "/ban-hang-off", text: "Tạo hóa đơn" },
      ],
    },
    {
      text: "Quản lý sản phẩm",
      roles: ["admin", "staff"],
      children: [
        { path: "/san-pham/danh-sach", text: "Danh sách sản phẩm" },
        { path: "/san-pham/mau-sac", text: "Danh sách màu sắc" },
        { path: "/san-pham/size", text: "Danh sách size" },
      ],
    },
    {
      text: "Quản lý danh mục & bộ sưu tập",
      roles: ["admin", "staff"],

      children: [
        { path: "/danh-muc/danh-sach", text: "Danh mục chính" },
        { path: "/bo-sieu-tap/danh-sach", text: "Bộ sưu tập theo mùa" },
      ],
    },
    {
      text: "Quản lý khách hàng",
      roles: ["admin", "staff"],

      children: [
        { path: "/khach-hang/danh-sach", text: "Danh sách khách hàng" },
      ],
    },
    {
      text: "Quản lý đơn hàng",
      roles: ["admin", "staff"],

      children: [{ path: "/don-hang/danh-sach", text: "Danh sách đơn hàng" }],
    },
    {
      text: "Quản lý khuyến mãi",
      roles: ["admin"],
      children: [
        { path: "/khuyen-mai/danh-sach", text: "Danh sách khuyến mãi" },
      ],
    },

    {
      text: "Quản lý Thống kê & báo cáo",
      roles: ["admin"],
      children: [{ path: "/tk-bc/them", text: "Thống kê & báo cáo" }],
    },
    {
      text: "Quản lý nhân viên",
      roles: ["admin", "hr"],
      children: [
        { path: "/admin/danh-sach", text: "Danh sách nhân viên" },
        { path: "/admin/cham-cong", text: "Theo dõi ngày công" },
      ],
    },
    {
      text: "Message",
      roles: ["admin"],
      children: [{ path: "/message/danh-sach", text: "Danh sách tin nhắn" }],
    },
    {
      text: "Quản lý nội dung & giao diện",
      roles: ["admin"],
      children: [
        { path: "/slide-banner/danh-sach", text: "Slide/banner trang chủ" },
        { path: "/tintuc-blog/danh-sach", text: "Tin tức / blog" },
        { path: "/ai/danh-sach", text: "Ai" },
        { path: "/footer/danh-sach", text: "Footer" },
        { path: "/trang-bao-tri", text: "Trang bảo trì" },
      ],
    },
  ];

  return (
    <>
      <button
        className="toggle-btn d-md-none"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="logo">
          <Link to="/" onClick={() => setSidebarOpen(false)}>
            <img src={logo} alt="Logo" />
          </Link>
        </div>

        <ul className="menu">
          {menu
            .filter((item) => item.roles?.includes(user?.role))
            .map((item, index) => (
              <li
                key={index}
                className={`menu-item ${openIndex === index ? "open" : ""}`}
              >
                <div
                  className="menu-title"
                  onClick={() => toggleSubMenu(index)}
                >
                  <span>{item.text}</span>
                  {item.children &&
                    (openIndex === index ? (
                      <FaChevronDown />
                    ) : (
                      <FaChevronRight />
                    ))}
                </div>
                {item.children && (
                  <ul
                    className={`submenu ${openIndex === index ? "show" : ""}`}
                  >
                    {item.children.map((sub, idx) => (
                      <li
                        key={idx}
                        className={
                          location.pathname === sub.path ? "active" : ""
                        }
                        onClick={() => setSidebarOpen(false)} // đóng menu sau khi chọn
                      >
                        <Link to={sub.path}>{sub.text}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
        </ul>

        <ul className="bottom-menu d-flex justify-content-center p-3 border-top mt-auto bg-white shadow-sm">
  <Button
    variant="light"
    onClick={handleLogout}
    title="Đăng xuất"
    className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill logout-btn"
  >
    <FaSignOutAlt />
    <span>Đăng xuất</span>
  </Button>
</ul>
      </aside>
    </>
  );
};

export default Menu;
