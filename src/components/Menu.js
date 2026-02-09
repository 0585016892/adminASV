import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu as AntMenu, Button, ConfigProvider, Avatar, Divider, Drawer } from "antd";
import { 
  LogoutOutlined, 
  ShoppingOutlined, 
  DatabaseOutlined, 
  TeamOutlined, 
  FileTextOutlined, 
  PieChartOutlined, 
  SettingOutlined,
  MenuUnfoldOutlined,
  CustomerServiceOutlined,
  AppstoreOutlined,
  GiftOutlined
} from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import logo from "../img/logo.png";

const MenuSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Cấu hình danh mục Menu dựa trên Role
  const menuItems = [
    {
      key: "/ban-hang-off",
      icon: <ShoppingOutlined />,
      label: "Bán hàng tại quầy",
      roles: ["admin", "staff"],
    },
    {
      key: "sub-products",
      icon: <DatabaseOutlined />,
      label: "Quản lý sản phẩm",
      roles: ["admin", "staff"],
      children: [
        { key: "/san-pham/danh-sach", label: "Danh sách sản phẩm" },
        { key: "/san-pham/mau-sac", label: "Danh sách màu sắc" },
        { key: "/san-pham/size", label: "Danh sách hình thức" },
      ],
    },
    {
      key: "sub-cat",
      icon: <AppstoreOutlined />,
      label: "Danh mục & Bộ sưu tập",
      roles: ["admin", "staff"],
      children: [
        { key: "/danh-muc/danh-sach", label: "Danh mục" },
        { key: "/bo-sieu-tap/danh-sach", label: "Bộ sưu tập" },
      ],
    },
    {
      key: "/khach-hang/danh-sach",
      icon: <TeamOutlined />,
      label: "Quản lý khách hàng",
      roles: ["admin", "staff"],
    },
    {
      key: "/don-hang/danh-sach",
      icon: <FileTextOutlined />,
      label: "Quản lý đơn hàng",
      roles: ["admin", "staff"],
    },
    {
      key: "/khuyen-mai/danh-sach",
      icon: <GiftOutlined />,
      label: "Quản lý khuyến mãi",
      roles: ["admin"],
    },
    {
      key: "/message/danh-sach",
      icon: <GiftOutlined />,
      label: "Nhắn tin",
      roles: ["admin"],
    },
    {
      key: "/tk-bc/them",
      icon: <PieChartOutlined />,
      label: "Thống kê & Báo cáo",
      roles: ["admin"],
    },
    {
      key: "sub-hr",
      icon: <CustomerServiceOutlined />,
      label: "Quản lý nhân viên",
      roles: ["admin", "hr"],
      children: [
        { key: "/admin/danh-sach", label: "Danh sách nhân viên" },
        { key: "/admin/cham-cong", label: "Theo dõi ngày công" },
      ],
    },
    {
      key: "sub-content",
      icon: <SettingOutlined />,
      label: "Nội dung & Giao diện",
      roles: ["admin"],
      children: [
        { key: "/slide-banner/danh-sach", label: "Slide/banner" },
        { key: "/tintuc-blog/danh-sach", label: "Tin tức / blog" },
        { key: "/ai/danh-sach", label: "Trợ lý AI" },
        { key: "/footer/danh-sach", label: "Footer" },
        { key: "/binh-luan", label: "Đánh giá sản phẩm" },
      ],
    },
  ];

  // Lọc menu theo quyền người dùng
  const filteredItems = menuItems
    .filter((item) => item.roles?.includes(user?.role))
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: item.children.map(child => ({
            ...child,
            onClick: () => { navigate(child.key); setMobileOpen(false); }
          }))
        };
      }
      return {
        ...item,
        onClick: () => { navigate(item.key); setMobileOpen(false); }
      };
    });

  const SidebarContent = () => (
    <div className="sidebar-inner">
      <div className="logo-section">
        <Link to="/" onClick={() => setMobileOpen(false)}>
          <img src={logo} alt="Logo" className="sidebar-logo" />
        </Link>
      </div>

      <div className="menu-scroll">
        <AntMenu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={filteredItems.filter(i => i.children).map(i => i.key)}
          items={filteredItems}
          className="acoustic-menu"
        />
      </div>

      <div className="sidebar-footer">
        <Divider style={{ margin: "12px 0", borderColor: "#f1ece1" }} />
        <div className="user-card">
          <Avatar 
            style={{ backgroundColor: '#c19a6b' }} 
            icon={<TeamOutlined />} 
          />
          <div className="user-meta">
            <div className="u-name">{user?.name || "Admin"}</div>
            <div className="u-role">{user?.role}</div>
          </div>
        </div>
        <Button 
          danger 
          block 
          icon={<LogoutOutlined />} 
          onClick={handleLogout}
          className="logout-btn"
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#5d4037", // Nâu Walnut
          colorBgContainer: "#fdfcf8", // Màu kem
          colorText: "#8a7b6f",
          borderRadius: 10,
        },
        components: {
          Menu: {
            itemBg: "transparent",
            itemSelectedBg: "#f5f2eb",
            itemSelectedColor: "#5d4037",
            itemHoverBg: "#faf9f6",
            subMenuItemBg: "transparent",
            itemHeight: 45,
          },
        },
      }}
    >
      <style>{`
        .sidebar-desktop {
          width: 280px;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          background: #fdfcf8;
          border-right: 1px solid #eeebe3;
          z-index: 100;
        }

        .sidebar-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .logo-section {
          padding: 30px 24px;
          text-align: center;
        }

        .sidebar-logo {
          max-height: 50px;
          filter: sepia(0.3);
        }

        .menu-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 0 10px;
        }

        .menu-scroll::-webkit-scrollbar { width: 4px; }
        .menu-scroll::-webkit-scrollbar-thumb { background: #e2dcd0; border-radius: 10px; }

        .acoustic-menu {
          border-inline-end: none !important;
        }

        .sidebar-footer {
          padding: 20px;
        }

        .user-card {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
          padding: 0 5px;
        }

        .user-meta .u-name {
          font-weight: 600;
          color: #5d4037;
          font-size: 14px;
          line-height: 1.2;
        }

        .user-meta .u-role {
          font-size: 11px;
          color: #a89485;
          text-transform: uppercase;
        }

        .logout-btn {
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-toggle {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 999;
          background: #5d4037;
          color: white;
          border: none;
        }

        @media (max-width: 768px) {
          .sidebar-desktop { display: none; }
        }
      `}</style>

      {/* Mobile Trigger */}
      <Button 
        className="d-md-none mobile-toggle"
        icon={<MenuUnfoldOutlined />}
        onClick={() => setMobileOpen(true)}
      />

      {/* Mobile Sidebar */}
      <Drawer
        placement="left"
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
        width={280}
        styles={{ body: { padding: 0, backgroundColor: "#fdfcf8" } }}
      >
        <SidebarContent />
      </Drawer>

      {/* Desktop Sidebar */}
      <aside className="sidebar-desktop">
        <SidebarContent />
      </aside>
    </ConfigProvider>
  );
};

export default MenuSidebar;