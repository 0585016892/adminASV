import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Unauthorized = () => {
  const { user, role } = useAuth();

  return (
    <div className="container mt-4">
      {" "}
      <div className="text-center mt-5">
        <h1>🚫 Không có quyền truy cập</h1>
        <p>Bạn không đủ quyền để xem trang này.</p>
        <Link to="/" className="btn btn-primary">
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
