import React from "react";
import { Link } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

const Unauthorized = () => {
  const { user, role } = useAuth();

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <div className="text-center p-4 shadow-lg rounded" style={{ background: "#fff", maxWidth: "500px" }}>
        <div className="mb-3 text-danger">
          <FaExclamationTriangle size={60} />
        </div>
        <h2 className="fw-bold">Không có quyền truy cập</h2>
        <p className="text-muted">Xin lỗi {user?.full_name || "bạn"}, bạn không đủ quyền để truy cập trang này.</p>
        <Link to="/" className="btn btn-outline-primary mt-3">
          ⬅ Quay về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
