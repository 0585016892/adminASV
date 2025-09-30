import React, { useState } from "react";
import { Breadcrumb } from "react-bootstrap";
import { FaChartBar, FaShoppingBag, FaStar, FaUsers } from "react-icons/fa";
import RevenueReport from "../components/report/RevenueReport";
import OrdersReport from "../components/report/OrdersReport";
import TopProductsReport from "../components/report/TopProductsReport";
import CustomerReport from "../components/report/CustomersReport";
import "../assets/ReportPage.css";

const ReportPage = () => {
  const [activeTab, setActiveTab] = useState("revenue");

  // Xác định tiêu đề và icon tương ứng
  const tabConfig = {
    revenue: { title: "Báo cáo doanh thu", icon: <FaChartBar size={18} /> },
    orders: { title: "Báo cáo đơn hàng", icon: <FaShoppingBag size={18} /> },
    "top-products": { title: "Top sản phẩm bán chạy", icon: <FaStar size={18} /> },
    customers: { title: "Thống kê khách hàng", icon: <FaUsers size={18} /> },
  };

  return (
    <div className="container-fluid my-4 px-4">
      <div className="report-container shadow-sm rounded-3 bg-white p-4">
        {/* Tabs header */}
        <ul className="report-tabs list-unstyled d-flex flex-wrap mb-4 border-bottom pb-2">
          <li
            className={`tab-item ${activeTab === "revenue" ? "active" : ""}`}
            onClick={() => setActiveTab("revenue")}
          >
            <FaChartBar size={16} className="me-2" />
            Báo cáo doanh thu
          </li>
          <li
            className={`tab-item ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <FaShoppingBag size={16} className="me-2" />
            Báo cáo đơn hàng
          </li>
          <li
            className={`tab-item ${activeTab === "top-products" ? "active" : ""}`}
            onClick={() => setActiveTab("top-products")}
          >
            <FaStar size={16} className="me-2" />
            Top sản phẩm bán chạy
          </li>
          <li
            className={`tab-item ${activeTab === "customers" ? "active" : ""}`}
            onClick={() => setActiveTab("customers")}
          >
            <FaUsers size={16} className="me-2" />
            Thống kê khách hàng
          </li>
        </ul>

        {/* Nội dung */}
        <div className="report-content mt-3">
          {activeTab === "revenue" && <RevenueReport />}
          {activeTab === "orders" && <OrdersReport />}
          {activeTab === "top-products" && <TopProductsReport />}
          {activeTab === "customers" && <CustomerReport />}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
