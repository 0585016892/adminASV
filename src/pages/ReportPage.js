import React, { useState } from "react";
import RevenueReport from "../components/report/RevenueReport";
import OrdersReport from "../components/report/OrdersReport";
import TopProductsReport from "../components/report/TopProductsReport";
import CustomerReport from "../components/report/CustomersReport";
import "../assets/ReportPage.css";

const ReportPage = () => {
  const [activeTab, setActiveTab] = useState("revenue");

  return (
    <div className="container-fluid my-4" style={{ paddingLeft: "35px" }}>
      <div className="report-container">
        <ul className="report-tabs">
          <li
            className={activeTab === "revenue" ? "active" : ""}
            onClick={() => setActiveTab("revenue")}
          >
            Báo cáo doanh thu
          </li>
          <li
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            Báo cáo đơn hàng
          </li>
          <li
            className={activeTab === "top-products" ? "active" : ""}
            onClick={() => setActiveTab("top-products")}
          >
            Top sản phẩm bán chạy
          </li>
          <li
            className={activeTab === "customers" ? "active" : ""}
            onClick={() => setActiveTab("customers")}
          >
            Thống kê khách hàng
          </li>
        </ul>

        <div className="report-content">
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
