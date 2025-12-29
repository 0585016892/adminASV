import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FaChevronDown, FaChevronRight, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import logo from "../img/logo.png";
import "../assets/Menu.css";

const Menu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [openIndex, setOpenIndex] = useState(null);
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
      children: [{ path: "/ban-hang-off", text: "Tạo hóa đơn" }],
    },
    {
      text: "Quản lý sản phẩm",
      roles: ["admin", "staff"],
      children: [
        { path: "/san-pham/danh-sach", text: "Danh sách sản phẩm" },
        { path: "/san-pham/mau-sac", text: "Danh sách màu sắc" },
        { path: "/san-pham/size", text: "Danh sách hình thức" },
      ],
    },
    {
      text: "Quản lý danh mục & bộ sưu tập",
      roles: ["admin", "staff"],
      children: [
        { path: "/danh-muc/danh-sach", text: "Danh mục " },
        { path: "/bo-sieu-tap/danh-sach", text: "Bộ sưu tập " },
      ],
    },
    {
      text: "Quản lý khách hàng",
      roles: ["admin", "staff"],
      children: [{ path: "/khach-hang/danh-sach", text: "Danh sách khách hàng" }],
    },
    {
      text: "Quản lý đơn hàng",
      roles: ["admin", "staff"],
      children: [{ path: "/don-hang/danh-sach", text: "Danh sách đơn hàng" }],
    },
    {
      text: "Quản lý khuyến mãi",
      roles: ["admin"],
      children: [{ path: "/khuyen-mai/danh-sach", text: "Danh sách khuyến mãi" }],
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
        { path: "/ai/danh-sach", text: "AI" },
        { path: "/footer/danh-sach", text: "Footer" },
        { path: "/binh-luan", text: "Đánh giá sản phẩm" },
        { path: "/trang-bao-tri", text: "Trang bảo trì" },
      ],
    },
  ];

  return (
    <>
      {/* Toggle button (mobile) */}
      <button
        className="d-md-none toggle-btn btn btn-primary position-fixed top-3 start-3"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>
      {isSidebarOpen && (
        <div
          className="d-md-none position-fixed top-0 start-0 w-100 h-100"
          style={{ backgroundColor: "rgba(0,0,0,0.3)", zIndex: 1050 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="logo">
          <Link to="/" onClick={() =>  setSidebarOpen(false)}>
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
                      <FaChevronDown className="icon" />
                    ) : (
                      <FaChevronRight className="icon" />
                    ))}
                </div>

                {item.children && (
                  <ul className={`submenu ${openIndex === index ? "show" : ""}`}>
                    {item.children.map((sub, idx) => (
                      <li
                        key={idx}
                        className={
                          location.pathname === sub.path ? "active" : ""
                        }
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Link to={sub.path}>{sub.text}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
        </ul>

        {/* Logout button */}
        <div className="bottom-menu">
          <Button
            variant="light"
            onClick={handleLogout}
            className="logout-btn"
          >
            <FaSignOutAlt />
            <span>Đăng xuất</span>
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Menu;
