import React from "react";
import { Link } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        height: "100vh",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
      }}
    >
      <div
        className="text-center p-5 rounded-4 shadow"
        style={{
          background: "#fff",
          maxWidth: "450px",
          width: "90%",
          animation: "fadeIn 0.8s ease-in-out",
        }}
      >
        <div
          className="d-flex justify-content-center align-items-center mb-4"
          style={{
            width: "100px",
            height: "100px",
            margin: "0 auto",
            borderRadius: "50%",
            background: "rgba(220,53,69,0.1)",
          }}
        >
          <FaExclamationTriangle size={50} color="#dc3545" />
        </div>
        <h2 className="fw-bold mb-3" style={{ color: "#dc3545" }}>
          Không có quyền truy cập
        </h2>
        <p className="text-muted mb-4">
          Xin lỗi <span className="fw-semibold">{user?.full_name || "bạn"}</span>, bạn không đủ quyền để truy cập trang này.
        </p>
        <Link
          to="/"
          className="btn btn-primary return-tt px-4 py-2 fw-semibold"
          style={{ transition: "0.3s" }}
        >
           Quay về trang chủ
        </Link>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(-20px);}
            100% { opacity: 1; transform: translateY(0);}
          }
          .return-tt:hover {
            background-color: #b02a37;
            border-color: #b02a37;
          }
        `}
      </style>
    </div>
  );
};

export default Unauthorized;
